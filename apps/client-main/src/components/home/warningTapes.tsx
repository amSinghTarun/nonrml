// {/* <div className="absolute inset-0 bg-white h-full w-full z-0 opacity-50" /> */}
// <div className="absolute inset-0 overflow-hidden opacity-[0.6] pointer-events-none">
// {/* Generate multiple tape lines at different positions */}
// {[
//   { top: '10%', rotate: '-30deg', texts: ['NONRML', 'RESTRICTED'] },
//   { top: '30%', rotate: '-25deg', texts: ['NOT NORMAL', 'NONRML'] },
//   { top: '50%', rotate: '-35deg', texts: ['SAY NO', 'NONRML'] },
//   { top: '70%', rotate: '-20deg', texts: ['DARE TO CREATE', 'NONRML'] },
//   { top: '90%', rotate: '-28deg', texts: ['BE STUBBORN', 'SAY NO'] },
// ].map((position, index) => (
//   <div 
//     key={index}
//     className="absolute h-[60px] bg-yellow-500 text-black -m-4 font-[Bebas_Neue] text-[28px] tracking-[5px] flex items-center whitespace-nowrap overflow-hidden"
//     style={{ 
//       top: position.top, 
//       width: '200%',
//       transform: `rotate(${position.rotate})`,
//       transformOrigin: 'left center',
//     }}
//   >
//     <div 
//       className="flex"
//       style={{
//         animation: 'scrollText 30s linear infinite'
//       }}
//     >
//       {Array.from({ length: 12 }).map((_, i) => (
//         position.texts.map((text, j) => (
//           <span key={`${i}-${j}`} className="mr-[30px]">{text}</span>
//         ))
//       ))}
//     </div>
//   </div>
// ))}
// </div>