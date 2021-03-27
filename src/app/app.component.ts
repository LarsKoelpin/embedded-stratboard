import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

const STRATBOARD_URL = 'https://draw.stratboard.de/';
const MY_HOST = 'https://myIframeHost.de/';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'embed-stratboard';
  queryParams = STRATBOARD_URL + '?host=my_host.de';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    let boardInitialized = false;
    let listener = [];

    window.addEventListener('message', (msg) => {
      if (isJson(msg.data)) {
        const parsed = JSON.parse(msg.data);
        switch (parsed.type) {
          case 'STRATBOARD_DRAWING_BOARD_INITIALIZED': {
            boardInitialized = true;
            console.log('Stratboard Iframe was initialized');
            listener.forEach((action) => action());
            listener = [];
            return;
          }
          case 'STRATBOARD_ROOM_WAS_HOSTED': {
            const roomId = parsed.roomId;
            this.router.navigate([], {
              queryParams: {
                room: roomId,
              },
              queryParamsHandling: 'merge',
            });
          }
        }
      }
    });

    this.route.queryParams.subscribe((params) => {
      const action = () => {
        const iFrame = document.getElementById('theFrame') as HTMLIFrameElement;
        iFrame.contentWindow.postMessage(
          JSON.stringify({
            type: 'STRATBOARD_CHANGE_ROUTE',
            url: `${STRATBOARD_URL}/p?room=${room}&host=${MY_HOST}`,
          }),
          '*'
        );
      };
      const room = params['room'];
      if (!boardInitialized && room) {
        listener.push(action);
      } else {
        action();
      }
    });
  }
}

function isJson(objectString: string) {
  let validJsonObject =
    typeof objectString !== 'string'
      ? JSON.stringify(objectString)
      : objectString;

  try {
    validJsonObject = JSON.parse(objectString);
  } catch (e) {
    return false;
  }

  if (typeof validJsonObject === 'object' && validJsonObject !== null) {
    return true;
  }

  console.log(validJsonObject, 'FALSE');
  return false;
}
