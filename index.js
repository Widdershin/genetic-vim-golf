import _ from 'lodash';
import levenshtein from 'fast-levenshtein';
import virtualVim from './src/virtual-vim';

const x = {
  string: 'x',
  name: 'delete'
}

const p = {
  string: 'p',
  name: 'put'
}

function generateCommand () {
  return _.sample([x, p]);
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

    return solution.rank + solution.score / totalScore;
  }, 0);

  return generation;
}

function breedChildren (generation, childrenToBreed) {
  //  Where breeding is defined as
  //    Rank all the solutions
  const rankedGeneration = rankGeneration(generation);;

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

    const firstParentCommand = firstParent[firstParentCrossoverIndex];
    const secondParentCommand = secondParent[secondParentCrossoverIndex];

    return [
      firstParent.map((command, index) => index === firstParentCrossoverIndex ? secondParentCommand : command),
      secondParent.map((command, index) => index === secondParentCrossoverIndex ? firstParentCommand : command)
    ];
  }

  return _.flatten(_.range(childrenToBreed / 2).map(breed));
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
    const children = breedChildren(sortedGeneration, populationSize / 2);
    const newSolutions = _.range(populationSize / 4).map(generateSolution);

    return topSolutions.concat(children, newSolutions);
  };
}

export default function golf (input, output, populationSize=10, generations=100) {
  // Given an input string and an output string
  //
  // And
  //    a population size: int
  //    a number of generations: int
  //
  function fitness (solution) {
    const solutionOutput = virtualVim({solution, input});

    return solution.length + (levenshtein.get(solutionOutput, output) * 100);
  }

  const population = _.range(populationSize).map(generateSolution);

  // Generate a starting population
  //   Map the size of the population
  //    A solution is a series of inputs (of random size)
  //      An input is either
  //        'x': delete
  //        'p': put
  const solutions = _.range(generations).reduce(evolve(fitness, populationSize), population);

  return _.minBy(solutions, fitness).map(command => command.string).join('');
}
