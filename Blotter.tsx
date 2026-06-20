import { useEffect } from "react";
import {useRef} from 'react';

export default function Blotter() {

  const display = useRef(null); 

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
    <table ref={display}>
      <thead>
        <tr>
          <th>Product</th>
          <th>Price</th>
          <th>Side</th>
          <th>Quantity</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>LTC-USD</td>
          <td>100</td>
          <td>Offer</td>
          <td>100</td>
        </tr>
      </tbody>
   </table>
  </div>
}


