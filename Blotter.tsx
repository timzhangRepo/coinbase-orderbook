import { useEffect } from "react";
import {useRef} from 'react';

type Level2Snapshot = {
  type: 'snapshot';
  product_id: string;
  bids: [string, string][];  // [price, size]
  asks: [string, string][];  // [price, size]
};

type Level2Update = {
  type: 'l2update';
  product_id: string;
  time: string;
  changes: ['buy' | 'sell', string, string][];  // [side, price, size]
};

type SubscriptionsMessage = {
  type: 'subscriptions';
  channels: { name: string; product_ids: string[] }[];
};

type Level2Message = Level2Snapshot | Level2Update | SubscriptionsMessage;

export default function Blotter() {

  const display = useRef<HTMLTableElement>(null); 

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

      // Data Process Blocks, best bid & best sell with current event batch, now how how this works
    
      const price = message.events[0].updates[0].price_level; // this contains bid and offer
      const priceCell = display.current?.querySelector('#price');
      if (priceCell) priceCell.textContent = price;
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
          <td id='price'>100</td>
          <td>Offer</td>
          <td>100</td>
        </tr>
      </tbody>
   </table>
  </div>
}


