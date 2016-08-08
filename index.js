import _ from 'lodash';
import levenshtein from 'fast-levenshtein';
import randomString from 'randomstring';

import virtualVim from './src/virtual-vim';
import stringSplice from './src/string-splice';

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

  const newChar = randomString.generate({
    length: 1,
    charset: 'alphabetic',
    capitalization: 'lowercase'
  });

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
  if (false) {
    return solution;
  }

  const approach = _.sample(['mutateNode']);

  if (approach === 'mutateNode') {
    const nodeIndexToMutate = _.random(solution.length - 1);

    return solution.map((command, index) => {
      if (index !== nodeIndexToMutate) {
        return command;
      }

      return mutateCommand(command);
    });
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

export default function golf (input, output, populationSize = 64, generations = 1000) {
  function fitness (solution) {
    const solutionOutput = virtualVim({solution, input});

    return solution.length + (levenshtein.get(solutionOutput, output) * 100);
  }

  const population = _.range(populationSize).map(generateSolution);

  const solutions = _.range(generations).reduce(evolve(fitness, populationSize), population);

  return _.minBy(solutions, fitness).map(command => command.string).join('');
}
