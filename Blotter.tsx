import { useEffect } from "react";
import {useRef} from 'react';

type Level2BookUpdate = {
  side: 'bid' | 'offer';
  event_time: string;
  price_level: string;
  new_quantity: string;
};

type Level2Event = {
  type: 'snapshot' | 'update';
  product_id: string;
  updates: Level2BookUpdate[];
};

type Level2Message = {
  channel: string;
  timestamp: string;
  sequence_num: number;
  events: Level2Event[];
};

export default function Blotter() {

  const display = useRef<HTMLTableElement>(null);
  const counterRef1 = useRef<HTMLSpanElement>(null);
  const counterRef2 = useRef<HTMLSpanElement>(null);

  const bidMap = new Map<string, string>();
  const offerMap = new Map<string, string>();

  useEffect(() => {
    let rafId: number;
    const ws = new WebSocket('wss://advanced-trade-ws.coinbase.com');
    ws.onopen = () => {
      ws.send(JSON.stringify({
          type: 'subscribe',
          product_ids: ['LTC-USD'],
          channel: 'level2'
      }));
    };

    ws.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data) as Level2Message;
      let events = message.events;

      events.forEach((event => {
        if(event.type && event.type === 'snapshot'){
           let update = event.updates;
           update.forEach((update) => {
              if(update.side === 'bid'){
                bidMap.set(update.price_level, update.new_quantity)
              } else {
                offerMap.set(update.price_level, update.new_quantity)
              }
           })
        }
        else if(event.type && event.type === 'update'){
          let update = event.updates;
           update.forEach((update) => {
              if(update.side === 'bid'){
                if(update.new_quantity === '0') bidMap.delete (update.price_level)
                else bidMap.set(update.price_level, update.new_quantity)
              } else {
                if(update.new_quantity === '0') bidMap.delete (update.price_level)
                else offerMap.set(update.price_level, update.new_quantity)
              }
           })
        }
      }))

      const price = message.events[0].updates[0].price_level;

      if (counterRef1.current)
        counterRef1.current.innerText = String(parseInt(counterRef1.current.innerText) + 1);

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {

        
        //Find best bid (highest) and best offer (lowest)
        let bestBid = Number.NEGATIVE_INFINITY;
        let quantBid = 0;
        for(let item of bidMap){
          if(parseFloat(item[0]) > bestBid){
              bestBid = parseFloat(item[0]);
              quantBid = parseFloat(item[1])
          }
        }

        let bestOffer = Number.POSITIVE_INFINITY;
        let quantOffer = 0;
        for(let item of offerMap){
          if(parseFloat(item[0]) < bestOffer){
              bestOffer = parseFloat(item[0]);
              quantOffer = parseFloat(item[1])
          }
        }

        const priceOffer = display.current?.querySelector('#priceOffer');
        const quantOfferDisplay = display.current?.querySelector('#quantOffer')
        if(priceOffer) priceOffer.textContent = String(bestOffer);
        if(quantOfferDisplay) quantOfferDisplay.textContent = String(quantOffer);

        const priceBid = display.current?.querySelector('#priceBid');
        const quantBidDisplay = display.current?.querySelector('#quantBid');
        if(priceBid) priceBid.textContent = String(bestBid);
        if(quantBidDisplay) quantBidDisplay.textContent = String(quantBid);

        if(counterRef2.current) {
          counterRef2.current.innerText = String(parseInt(counterRef2.current.innerText) + 1);
        }
      })
    };
  }, [])
  
  return <div>
    <p>
      WebSocket Messages Received: <span ref={counterRef1}>0</span>
    </p>
    <p>
      DOM Paints: <span ref={counterRef2}>0</span>
    </p>
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
          <td id='priceOffer'>100</td>
          <td>Offer</td>
          <td id='quantOffer'>100</td>
        </tr>
          <tr>
          <td>LTC-USD</td>
          <td id='priceBid'>100</td>
          <td>Bid</td>
          <td id='quantBid'>100</td>
        </tr>
      </tbody>
   </table>
  </div>
}


