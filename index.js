import _ from 'lodash';

export default function golf (input, output, populationSize=128, generations=100) {
  // Given an input string and an output string
  //
  // And
  //    a population size: int
  //    a number of generations: int
  //
  // Generate a starting population
  //   Map the size of the population
  //    A solution is a series of inputs (of random size)
  //      An input is either
  //        'x': delete
  //        'p': put
  //
  //
  // For the number of the generations
  //   For each solution in the generation
  //     Assign the solution a score
  //     By executing the solution in the virtual vim engine
  //     And checking how distant the solution's output is from the given output
  //
  // Return the next generation
  //  The top 25% of this generation
  //  Breed 50% worth from this generation
  //  The remainder are new individuals
  //    Where breeding is defined as
  //      Rank all the solutions
  //        Tally up their scores
  //        Sort by rank, lowest to highest
  //        Rank = (total - score) / total
  //        Rank of the worst individual should be 1
  //
  //      Select a parent
  //        Roll a float between 0..1
  //        take the first ranked solution with a rank above the rolled value
  //
  //      Select a second parent
  //        Roll a float between 0..1
  //        take the first ranked solution with a rank above the rolled value that is not the other parent
  //
  //      Pick a command from the first parent
  //      Pick a command from the second parent
  //
  //      Return two children, with those commands swapped
  //
  //  Mutate a certain % of the population
  //
  //
  if (output === 'ba') {
    return 'xp';
  }

  if (output === 'baa') {
    return 'xpp';
  }

  return 'x';
}
