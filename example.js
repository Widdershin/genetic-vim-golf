import {run} from '@cycle/xstream-run';
import {makeDOMDriver, input, div, pre} from '@cycle/dom';
import xs from 'xstream';
import golf from './index';
import worker from './worker';

import work from 'webworkify';

function golfDriver (sink$, streamAdapter) {
  const w = work(worker);

  const {observer, stream} = streamAdapter.makeSubject();

  sink$.addListener({
    next (input) {
      w.postMessage(input)
    },

    error (err) {
      console.error(err);
    },

    complete () {
    }
  });

  w.addEventListener('message', function (ev) {
    observer.next(JSON.parse(ev.data));
  });

  return streamAdapter.remember(stream);
}

function view (golf) {
  return (
    div([
      div([
        `Start text:`,
        input('.start-text')
      ]),

      div([
        `Target text:`,
        input('.target-text')
      ]),

      div([
        `Solution:`,

        pre(golf.solution),

        `Result`,

        pre(golf.result),

        `Generation ${golf.generation}`
      ])
    ])
  );
}

function main ({DOM, Golf}) {
  const startText$ = DOM
    .select('.start-text')
    .events('change')
    .map(ev => ev.target.value)
    .startWith('');

  const targetText$ = DOM
    .select('.target-text')
    .events('change')
    .map(ev => ev.target.value)
    .startWith('');

  const golfInput$ = xs
    .combine(startText$, targetText$);

  return {
    DOM: Golf.map(view),
    Golf: golfInput$
  };
}

const drivers = {
  DOM: makeDOMDriver('.app'),
  Golf: golfDriver
}

run(main, drivers);
