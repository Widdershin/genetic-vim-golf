import _ from 'lodash';
import levenshtein from 'fast-levenshtein';

import randomString from './src/random-string';
import virtualVim from './src/virtual-vim';
import stringSplice from './src/string-splice';

import xs from 'xstream';

function generateCommand () {
  return virtualVim.generateCommand();
}

function generateSolution () {
  const numberOfCommands = _.random(1, 5);

  return _.range(numberOfCommands).map(generateCommand);
}

function rankGeneration (generation) {
  //        Rank = (total - score) / total
  //        Rank of the worst individual should be 1
  const totalScore = _.sumBy(generation, 'score');

  generation.reduce((accumulatedScore, solution) => {
    solution.rank = 1 - accumulatedScore;

    return accumulatedScore + solution.score / totalScore;
  }, 0);

  return generation;
}

function breedChildren (generation, childrenToBreed) {
  //  Where breeding is defined as
  //    Rank all the solutions
  const rankedGeneration = rankGeneration(generation);

  function breed () {
    //  Select a parent
    //    Roll a float between 0..1
    //    take the first ranked solution with a rank above the rolled value
    //
    //  Select a second parent
    //    Roll a float between 0..1
    //    take the first ranked solution with a rank above the rolled value that is not the other parent
    //
    //  Pick a command from the first parent
    //  Pick a command from the second parent
    //
    //  Return two children, with those commands swapped
    const firstParentRoll = _.random(0, 1, true);

    const firstParent = rankedGeneration.find(solution => solution.rank > firstParentRoll);

    const secondParentRoll = _.random(0, 1, true);

    let secondParent = rankedGeneration.find(solution => solution.rank > secondParentRoll && solution !== firstParent);

    if (!secondParent) {
      secondParent = rankedGeneration.find(solution => solution !== firstParent);
    }

    const firstParentCrossoverIndex = _.random(0, firstParent.length - 1);
    const secondParentCrossoverIndex = _.random(0, secondParent.length - 1);

    let firstParentCommand = firstParent[firstParentCrossoverIndex];
    let secondParentCommand = secondParent[secondParentCrossoverIndex];

    return [
      firstParent.map((command, index) => index === firstParentCrossoverIndex ? secondParentCommand : command),
      secondParent.map((command, index) => index === secondParentCrossoverIndex ? firstParentCommand : command)
    ];
  }

  return _.flatten(_.range(childrenToBreed / 2).map(breed));
}

function mutateString (string) {
  const indexToMutate = _.random(string.length - 1);

  const newChar = randomString(1);

  const [newString] = stringSplice(string, indexToMutate, 1, newChar);

  return newString;
}

function mutateCommand (command) {
  if (command.type === 'i') {
    const mutatedString = mutateString(command.stringToInsert);

    return Object.assign({}, command, {
      stringToInsert: mutatedString,
      string: `i${mutatedString}<Esc>`
    });
  }

  return command;
}

function mutate (solution) {
  if (Math.random() < 0.5) {
    return solution;
  }

  const approach = _.sample(['mutateNode', 'removeNode']);

  if (approach === 'mutateNode') {
    const nodeIndexToMutate = _.random(solution.length - 1);

    return solution.map((command, index) => {
      if (index !== nodeIndexToMutate) {
        return command;
      }

      return mutateCommand(command);
    });
  } else if (approach === 'removeNode') {
    const clonedSolution = solution.slice();

    const nodeIndexToMutate = _.random(solution.length - 1);

    clonedSolution.splice(nodeIndexToMutate, 1);

    return clonedSolution;
  } else {
    throw new Error('Unhandled approach: ' + approach);
  }
}

// takes a previous generation and returns a new generation
function evolve (fitnessFunction, populationSize) {
  return (generation) => {
    //   For each solution in the generation
    //     Assign the solution a score
    //     By executing the solution in the virtual vim engine
    //     And checking how distant the solution's output is from the given output
    //
    // Return the next generation
    //  The top 25% of this generation
    //  Breed 50% worth from this generation
    //  The remainder are new individuals
    //
    //  Mutate a certain % of the population
    generation.forEach(solution => {
      solution.score = fitnessFunction(solution);
    });

    const sortedGeneration = _.sortBy(generation, 'score');
    const topSolutions = sortedGeneration.slice(0, populationSize / 4);

    const children = breedChildren(sortedGeneration, populationSize / 2).map(mutate);
    const newSolutions = _.range(populationSize / 4).map(generateSolution);

    return topSolutions.concat(children, newSolutions)
  };
}

export default function golf (input, output, populationSize = 64) {
  function fitness (solution) {
    const solutionOutput = virtualVim({solution, input});

    return solution.length + (levenshtein.get(solutionOutput, output) * 100);
  }

  const population = _.range(populationSize).map(generateSolution);

  let stopped = false;
  let _population = population;
  let id = 0;
  let generation = 0;

  const producer = {
    start: function (listener) {
      function go () {
        const newPopulation = evolve(fitness, populationSize)(_population);

        _population = newPopulation;

        const bestSolution = _.minBy(_population, fitness)
        const bestSolutionString = bestSolution.map(command => command.string).join('');

        const result = virtualVim({solution: bestSolution, input});

        listener.next({solution: bestSolutionString, result, generation});

        generation += 1;

        if (!stopped) {
          setInterval(go, 0);
        }
      }

      id = setInterval(go, 0);
    },

    stop: function () {
      stopped = true;
      clearInterval(id);
    }
  };

  return xs.create(producer);
}
