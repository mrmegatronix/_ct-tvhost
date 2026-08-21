import { SlideData } from './types';

export const INITIAL_SLIDES: SlideData[] = [
  {
    id: '0',
    day: 'Welcome',
    title: 'Coasters Tavern',
    description: 'Welcome to your local favorite. Enjoy our hospitality and great food.',
    price: '',
    imageUrl: '',
    backgroundImageUrl: '',
    descriptionImageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1920&q=80',
    highlightColor: '#d4af37',
    type: 'promo',
    disabled: false
  },
  {
    id: '1',
    day: 'Monday',
    title: 'Steak Day Monday\'s',
    description: 'Start your week off with a 200g Succulent Rump Steak, cooked to your liking, served with golden fries and a green garden salad.',
    price: '$20',
    imageUrl: 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?auto=format&fit=crop&w=800&q=80',
    backgroundImageUrl: 'https://images.unsplash.com/photo-1558039948-c7cfe9696777?auto=format&fit=crop&w=1920&q=80',
    highlightColor: '#f59e0b',
    type: 'promo',
    disabled: false
  },
  {
    id: '2',
    day: 'Wednesday',
    title: 'Quiz Night',
    description: 'Every Wednesday Night from 7.00pm, $190 in prizes up for grabs. Bookings Essential.',
    price: 'FREE ENTRY',
    highlightColor: '#eab308',
    type: 'promo',
    disabled: false
  },
  {
    id: '3',
    day: 'Thursday',
    title: 'Burger Day Thursdays',
    description: 'Your choice of Chicken, Beer Battered Fish, Pork Belly or Coasters Beef Burger, all served with Golden Fries & Onion Rings.',
    price: '$19 each or 2 for $35!',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    highlightColor: '#f97316',
    type: 'promo',
    disabled: false
  },
  {
    id: '4',
    day: 'Sunday',
    title: 'Two Course Sunday Roast',
    description: 'Traditional roast of the day with roasted vegetables, seasonal greens and rich gravy, with an Ice Cream Sundae to finish.',
    price: '$28',
    imageUrl: 'https://images.unsplash.com/photo-1514516348920-f5d8964d7f2d?auto=format&fit=crop&w=800&q=80',
    highlightColor: '#84cc16',
    type: 'promo',
    disabled: false
  },
  {
    id: '4',
    type: 'promo',
    day: 'Thursday',
    title: 'Monster Meat Raffle',
    description: 'Tickets $5 each or 5 for $20! Draws start at 7pm.',
    price: '$5 / $20',
    highlightColor: '#ef4444',
    disabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: '5',
    type: 'promo',
    day: 'Thursday',
    title: 'Losers Draw',
    description: '2 Chances to win! Drawn immediately after the Monster Raffle.',
    price: 'EXCLUSIONS APPLY',
    highlightColor: '#8b5cf6',
    disabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: '6',
    type: 'promo',
    day: 'Quiz Night',
    title: 'Weekly Quiz',
    description: 'Bring your team and test your knowledge! Great prizes to be won.',
    price: 'FREE ENTRY',
    highlightColor: '#10b981',
    disabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop'
  }
];
