// Drop optional thumbnails in /public/img/<slug>.webp (~400px wide). Missing images fall back to the emoji tile.
export const PLACES = [
  { slug: 'diabari', name: 'Diabari', emoji: '🌳', desc: 'Quiet green paths and a lake, just for us.' },
  { slug: 'botanical', name: 'Botanical Garden', emoji: '🌷', desc: 'Flowers everywhere, but you still win.' },
  { slug: 'chandrima', name: 'Chandrima Uddhan', emoji: '🌙', desc: 'Moonlit-vibe walks and sweet talks.' },
  { slug: 'dhanmondi', name: 'Dhanmondi Lake', emoji: '🌅', desc: 'Sunset by the water, hand in hand.' },
  { slug: 'tsc', name: 'TSC', emoji: '☕', desc: 'Chai, adda and classic Dhaka charm.' },
  { slug: 'suhrawardy', name: 'Suhrawardy Uddyan', emoji: '🕊️', desc: 'Wide open lawns for a peaceful stroll.' },
  { slug: 'ramna', name: 'Ramna Park', emoji: '🍃', desc: 'Big trees, cool shade, cute memories.' },
  { slug: 'shahabuddin', name: 'Shahabuddin Park', emoji: '🪷', desc: 'A calm little corner to talk for hours.' },
  { slug: 'gulshan-park', name: 'Shahid Dr. Fazle Rabbi Park, Gulshan', emoji: '🦢', desc: 'Lakeside walks in lovely Gulshan.' },
  { slug: 'north-end', name: 'North End Coffee Roasters', emoji: '🥐', desc: 'Cozy coffee date, pastries included.' },
]
export const FOODS = [
  ['biriyani', 'Biriyani', '🍛'], ['khichuri', 'Khichuri', '🥘'], ['pizza', 'Pizza', '🍕'],
  ['burger', 'Burger', '🍔'], ['pasta', 'Pasta', '🍝'], ['chicken', 'Fried Chicken', '🍗'],
  ['shawarma', 'Shawarma', '🌯'], ['fuchka', 'Fuchka and Chotpoti', '🌶️'], ['momo', 'Momo', '🥟'],
  ['icecream', 'Ice Cream', '🍦'], ['coffee', 'Hot Coffee', '☕'], ['boba', 'Bubble Tea', '🧋'],
  ['other', 'Something Else', '✨'],
].map(([slug, name, emoji]) => ({ slug, name, emoji }))
export const TIMES = ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM']
export const TEASES = ['Nice try! 😂', 'Not an option, cutie! 🤭', 'You know you want to say YES! 💕', 'The NO button is shy today 🙈', 'Just press YES already 🥹']
export const STEPS = ['Invite', 'Date', 'Time', 'Place', 'Food', 'Pay', 'Done']
export const PAY_NUMBER = '01851161908'
