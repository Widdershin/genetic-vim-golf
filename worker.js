import golf from './index';
import xs from 'xstream';

let stream = xs.create();

export default function (self) {
  self.addEventListener('message', function (message) {
    stream.shamefullySendComplete();

    const [startText, targetText] = message.data;

    console.log(startText, targetText);

    const golf$ = golf(startText, targetText);

    stream = golf$;

    golf$.addListener({
      next (ev) {
        self.postMessage(JSON.stringify(ev));
      },

      error (err) {
        console.error(err);
      },

      complete () {
      }
    })
  });
}

