## Stage 1

First starting with the basics, a bare minimum React, with useRef, and ref to the tag to just get started with data comes in, refresh the tag, with things showing, and clear cut

```Typescript
useEffect(() => {
    const ws = new WebSocket('wss://advanced-trade-ws.coinbase.com');
    ws.onopen = () => {
    // Only subscribe AFTER the connection is open
    ws.send(JSON.stringify({
        type: 'subscribe',
        product_ids: ['LTC-USD'],
        channel: 'level2'
    }));
    };
    ws.onmessage = (event: MessageEvent) => {
    const message = JSON.parse(event.data);
    //@ts-ignore
    display.current.innerText = event.data;
    };
  })

  return <div>

    <p ref={display}> </p>

  </div>
```





## Stage 2