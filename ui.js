// Shared illustrated icons keep every game in the same visual family.
function gameIcon(type){
 const cells={memory:0,travel:1,personal:2,puzzle:3,rhythm:4,platform:5,gift:6};
 if(type in cells){const n=cells[type];return `<span class="game-icon illustrated-icon" aria-hidden="true" style="background-position:${n%4*100/3}% ${Math.floor(n/4)*100}%"></span>`;}
 const shapes={
 memory:'<rect x="13" y="12" width="37" height="47" rx="7" fill="#74d4ee" transform="rotate(-13 32 35)"/><rect x="29" y="18" width="37" height="47" rx="7" fill="#ffedbd" transform="rotate(10 48 41)"/><path d="M48 52 37 42C27 32 41 26 48 35C55 26 69 32 59 42Z" fill="#f47a91"/>',
 travel:'<circle cx="40" cy="38" r="27" fill="#58ccec"/><path d="m22 19 10-5 9 6-3 9 10 5-4 11-9-2-5-11-12-3Zm27 32 8-8 9 1-8 14-8 5Z" fill="#9cd857"/><path d="M18 64h43M40 65v-7" stroke="#df9a32" stroke-width="7"/>',
 personal:'<path d="M40 65 13 39C-5 18 24 1 40 21C56 1 85 18 67 39Z" fill="#f47a91"/><path d="m22 25 6-4" stroke="#ffe1e8" stroke-width="7"/>',
 puzzle:'<path d="M14 15h19c-8 14 15 17 10 0h20v20c-16-6-15 17 0 10v19H43c6-16-17-16-10 0H14V45c17 6 17-17 0-10Z" fill="#91d94e"/>',
 rhythm:'<path d="M30 52V20l33-8v34" fill="none" stroke="#a874db" stroke-width="11"/><path d="m30 29 33-9" stroke="#d3aeff" stroke-width="5"/><ellipse cx="21" cy="54" rx="13" ry="10" fill="#ed8bb6"/><ellipse cx="54" cy="48" rx="13" ry="10" fill="#ed8bb6"/>',
 platform:'<path d="m9 39 25-7 3-21c1-9 9-9 10 0l3 21 23 8v7l-25-3-1 17 10 7v5l-16-4-16 4v-5l10-7-1-17-25 3Z" fill="#eafaff"/><path d="m37 18 9-1" stroke="#60b9e1" stroke-width="5"/>',
 gift:'<rect x="13" y="29" width="54" height="39" rx="7" fill="#ee83ab"/><rect x="9" y="25" width="62" height="15" rx="5" fill="#ffabc6"/><path d="M40 27c-35-1-24-31-5-14l5 12c35-1 24-31 5-14Z" fill="#ffd35c"/><path d="M40 27v41" stroke="#ffe280" stroke-width="11"/>'
 };
 return `<svg class="game-icon" viewBox="0 0 80 80" aria-hidden="true"><g stroke="#87542c" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">${shapes[type]||shapes.gift}</g></svg>`;
}
