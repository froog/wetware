// =========================================================================
// THE MENUS -- File / Edit / View / こんにちは / Special
//
// Each menu opens as an honest System 7 menu. Keep descending and the
// machine stops pretending. Underneath the desktop metaphor is a
// dystopian OS that has confused your files for your self, your screen
// for a window it can see back through, and this session for a sentence.
// Hover to go deeper; retreat one level and the corridor folds shut --
// backtracking is always one hover away. Nothing here is load-bearing.
// =========================================================================

// Item shapes:
//   'label'                          plain item (inert; blinks and closes)
//   '-'                              separator
//   { label, items: [...] }         submenu
//   { label, action: 'name' }       wired leaf (see ACTIONS in initMenus)
//   { label, cls: 'dim'|'glitch' }  styling: narration / corruption

// =========================================================================
// LOOK -- a classic text adventure that lives inside the View menu. Each
// scene's first row is the description (grey narration); the remaining rows
// are the choices. Descend by hovering a choice; retreat by drifting back a
// level. scene()/descend() assemble the nested menu-item tree so a path can
// run ~50 rooms deep without hand-nesting the literals.
// =========================================================================
function scene(desc, choices, descCls = 'dim') {
  const items = [{ label: desc, cls: descCls }];
  for (const [label, node] of Object.entries(choices)) {
    if (node == null) items.push({ label });                        // inert flavor
    else if (node.__scene) items.push({ label, items: node.items }); // sub-scene
    else items.push({ label, ...node });                            // {action, cls}
  }
  return { __scene: true, items };
}
const wake = { action: 'wake' };
const blast = { action: 'staticBlast', cls: 'glitch' };

const DEEP_FLAVOR = [
  'Wet stone steps, downward.',
  'The dark thickens.',
  'Roots grope the ceiling.',
  'Your torch gutters.',
  'A door. Then the same door.',
  'The steps seem to breathe.',
  'Something counts your footfalls.',
  'The walls are warm now.',
  'Down. Always down.',
  'The air tastes of copper.',
  'A hum with no source.',
  'You have been here before.',
];

// n chained rooms; "Deeper" is the spine, with the odd branching passage.
function descend(n, bottom) {
  let node = bottom;
  for (let i = n; i >= 1; i--) {
    const choices = {};
    choices['Deeper'] = node;
    if (i % 5 === 0) {
      choices['A side passage'] = scene('A low alcove, barely a room.', {
        'Feel the wall': scene('Fingers meet yours from the other side.',
          { 'Pull away': wake, 'Hold on': blast }, 'glitch'),
        'Back to the steps': wake,
      });
    }
    if (i % 8 === 0) {
      choices['Light a match'] = scene('Brief gold. Faces set into the brick.',
        { 'Blow it out': wake }, 'glitch');
    }
    choices['Turn back'] = wake;
    node = scene(DEEP_FLAVOR[i % DEEP_FLAVOR.length], choices, i % 7 === 0 ? 'glitch' : 'dim');
  }
  return node;
}

const CAVE_BOTTOM = scene('The bottom. A door marked EXIT in your own hand.', {
  'Open it': wake,
  'It opens onto the forest': blast,
});

const LOOK = scene('A dark forest. Moonlight between the pines.', {
  'A house, unlit': scene('A house. The door stands ajar.', {
    'Knock': scene('The knock is answered before your hand lands.',
      { 'Step back': wake, 'Try the handle': blast }, 'glitch'),
    'Go inside': scene('A hallway. Coats with no one in them.', {
      'The kitchen': scene('Cold stove. A kettle, somehow still warm.', {
        'Drink the tea': blast,
        'Open the pantry': scene('Jars of dates. Every one is a future.', { 'Close it': wake }),
        'Leave': wake,
      }),
      'Up the stairs': scene('A landing. Family photos, faces scratched out.', {
        'The bedroom': scene('Your bed, slept in. Still warm.', {
          'Look underneath': scene('Another you, hiding. "Quiet," it says.',
            { 'Hide too': blast, 'Run': wake }, 'glitch'),
          'Leave': wake,
        }),
        'The attic': scene('Boxes labelled with your age, past now and rising.',
          { 'Open the last one': blast, 'Go down': wake }),
      }),
      'The cellar': scene('Stairs going down into the dark.',
        { 'Descend': descend(48, CAVE_BOTTOM), 'Back up': wake }),
    }),
    'Peer in the window': scene('You are inside, asleep at the desk.',
      { 'Tap the glass': blast, 'Step away': wake }, 'glitch'),
    'Back to the trees': wake,
  }),
  'North, to a stream': scene('A stream, black and quick.', {
    'Drink': scene('It tastes of static.', { 'Keep drinking': blast, 'Spit it out': wake }, 'glitch'),
    'Cross it': scene('The far bank is the near bank.', {
      'Cross again': scene('Again the same bank.', { 'Again': blast, 'Sit down': wake }),
      'Turn back': wake,
    }),
    'Follow it down': scene('It pours into a hole in the world.',
      { 'Follow it': descend(46, CAVE_BOTTOM), 'Stay': wake }),
  }),
  'South, up the mountain': scene('A steep path. The pines lean the wrong way.', {
    'Climb': scene('Higher. The town below blinks out, house by house.', {
      'Keep climbing': scene('A cave mouth gapes in the rock face.', {
        'Go in': descend(48, CAVE_BOTTOM),
        'Climb past it': scene('The summit. A chair, facing away from you.',
          { 'Turn the chair around': blast, 'Descend': wake }, 'glitch'),
      }),
      'Rest against a rock': scene('You sit. You do not get up for a while.', { 'Get up': wake }),
    }),
    'Back down': wake,
  }),
  'Pick up a rock': scene('A cold rock. Something is scratched underneath.', {
    'Read it': scene('Your name, and a date. The date is today.',
      { 'Drop it': wake, 'Pocket it': blast }, 'glitch'),
    'Throw it': scene('It does not land.', { 'Listen': wake }),
  }),
  'Look up': scene('No stars. A ceiling of dark tile, fluorescent-flecked.',
    { 'Reach up': blast, 'Look down again': wake }, 'glitch'),
});

export const MENU_DEFS = [
  {
    label: 'File',
    items: [
      { label: 'New Scene', action: 'randomize' },
      {
        label: 'Open Recent',
        items: [
          'untitled-vaporwave.psd',
          'sunset_FINAL.psd',
          'sunset_FINAL_v2.psd',
          '-',
          {
            label: '~/you/',
            items: [
              { label: 'memories.tar - 4.2 TB', cls: 'dim' },
              { label: 'childhood/ (corrupt)', cls: 'dim' },
              {
                label: 'faces/',
                items: [
                  { label: 'mother.jpg - unreadable', cls: 'dim' },
                  { label: 'yours.jpg - 0 bytes', cls: 'dim' },
                  {
                    label: 'Rebuild from cache',
                    items: [
                      { label: 'Cache is someone else', cls: 'dim' },
                      { label: 'Use it anyway', action: 'staticBlast', cls: 'glitch' },
                      { label: 'Leave the folder', action: 'wake' },
                    ],
                  },
                ],
              },
              {
                label: 'Restore backup',
                items: [
                  { label: 'Backup dated tomorrow', cls: 'dim' },
                  {
                    label: 'Restore anyway',
                    items: [
                      { label: 'You are now the copy', cls: 'glitch' },
                      {
                        label: 'Find the original',
                        items: [
                          { label: 'Original: deprecated', cls: 'dim' },
                          { label: 'Original: recalled', cls: 'dim' },
                          { label: 'Become the backup', action: 'staticBlast', cls: 'glitch' },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        label: 'Save As...',
        items: [
          'vaporwave.png',
          'vaporwave.psd',
          '-',
          {
            label: 'self.iso',
            items: [
              { label: 'Overwrite you?', cls: 'dim' },
              {
                label: 'Keep both',
                items: [
                  { label: 'Instances: 1,024', cls: 'dim' },
                  { label: 'Instances: 1,025', cls: 'dim' },
                  {
                    label: 'Which one types this?',
                    items: [
                      { label: 'None of them', action: 'staticBlast', cls: 'glitch' },
                      { label: 'Stop copying', action: 'wake' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        label: 'Print...',
        items: [
          { label: 'Printer: SELF/ttyS0', cls: 'dim' },
          { label: 'Copies: infinite', cls: 'dim' },
          {
            label: 'Print to skin',
            items: [
              { label: 'Ink: warm', cls: 'dim' },
              { label: 'It stays under', cls: 'glitch' },
              { label: 'Cancel job', action: 'wake' },
            ],
          },
        ],
      },
      '-',
      { label: 'Quit', action: 'quit' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo Typo', cls: 'dim' },
      {
        label: 'Undo',
        items: [
          'Undo Move',
          'Undo Delete',
          '-',
          {
            label: 'Undo This Morning',
            items: [
              { label: 'It did not happen', cls: 'dim' },
              {
                label: 'Undo the Argument',
                items: [
                  { label: 'They never left', cls: 'dim' },
                  {
                    label: 'Undo Them',
                    items: [
                      { label: 'Removed from record', cls: 'dim' },
                      { label: 'Removed from memory', cls: 'dim' },
                      { label: 'Who are you missing?', action: 'staticBlast', cls: 'glitch' },
                      { label: 'Stop editing', action: 'wake' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        label: 'Redo',
        items: [
          { label: 'Nothing to redo', cls: 'dim' },
          {
            label: 'Redo it anyway',
            items: [
              { label: 'The same day, again', cls: 'dim' },
              { label: 'The same day, again', cls: 'dim' },
              { label: 'The same day, aga̸i̸n̸', cls: 'glitch' },
            ],
          },
        ],
      },
      '-',
      'Cut',
      'Copy',
      {
        label: 'Paste',
        items: [
          'Paste Plain',
          'Paste & Match Style',
          {
            label: 'Paste Memory',
            items: [
              { label: 'Whose?', cls: 'dim' },
              {
                label: 'Ministry-approved set',
                items: [
                  { label: 'Approved childhood', cls: 'dim' },
                  { label: 'Approved parents', cls: 'dim' },
                  {
                    label: 'Accept revision',
                    items: [
                      { label: 'You always loved it here', cls: 'glitch' },
                      { label: 'Refuse', action: 'wake' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      '-',
      {
        label: 'Find...',
        items: [
          'Find in Scene',
          {
            label: 'Find Yourself',
            items: [
              { label: '0 results', cls: 'dim' },
              {
                label: 'Search harder',
                items: [
                  { label: 'Match: behind you', cls: 'dim' },
                  { label: 'Match: in the screen', cls: 'glitch' },
                  { label: 'Close search', action: 'wake' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    label: 'View',
    items: [
      'by Icon',
      'by Name',
      'by Date',
      '-',
      { label: 'Look', items: LOOK.items },
      '-',
      {
        label: 'Show Camera',
        items: [
          { label: 'Front camera: ON', cls: 'dim' },
          { label: 'Recording since 1998', cls: 'dim' },
          {
            label: 'Who is watching',
            items: [
              'The Operator',
              'The Advertisers',
              {
                label: 'The Other Tenant',
                items: [
                  { label: 'Lives in the walls', cls: 'dim' },
                  { label: 'Pays in your time', cls: 'dim' },
                  { label: 'Wave to it', action: 'staticBlast', cls: 'glitch' },
                  { label: 'Cover the lens', action: 'wake' },
                ],
              },
            ],
          },
        ],
      },
      {
        label: 'Zoom',
        items: [
          '100%',
          '200%',
          {
            label: 'infinity %',
            items: [
              { label: 'Pixels have rooms', cls: 'dim' },
              {
                label: 'Enter a pixel',
                items: [
                  { label: 'It is furnished', cls: 'dim' },
                  { label: 'It is occupied', cls: 'glitch' },
                  { label: 'Zoom back out', action: 'wake' },
                ],
              },
            ],
          },
        ],
      },
      {
        label: 'Night Mode',
        items: [
          'Dim',
          'Dimmer',
          {
            label: 'Total Dark',
            items: [
              { label: 'The sun is optional', cls: 'dim' },
              { label: 'Turn it off', action: 'sunOff' },
              { label: 'Wake', action: 'wake' },
            ],
          },
        ],
      },
    ],
  },
  {
    label: 'こんにちは',
    items: [
      { label: 'いらっしゃいませ', cls: 'dim' },
      '-',
      { label: '見る (look)', action: 'kanji' },
      { label: '太陽 (sun)', action: 'sunToggle' },
      { label: '雨 (rain)', action: 'rainToggle' },
      { label: 'サイコロ (dice)', action: 'randomize' },
      '-',
      {
        label: 'モール (the mall)',
        items: [
          { label: '営業中 24H (暗い)', cls: 'dim' },
          {
            label: 'フードコート',
            items: [
              { label: 'すべて閉店', cls: 'dim' },
              {
                label: '噴水',
                items: [
                  { label: '1994年から乾いている', cls: 'dim' },
                  { label: '願い: 帰宅', action: 'wake' },
                  { label: '願い: 永住', action: 'staticBlast', cls: 'glitch' },
                ],
              },
            ],
          },
          {
            label: 'ホステス AI',
            items: [
              { label: 'ようこそ、お客様', cls: 'dim' },
              { label: 'あなたを覚えています', cls: 'dim' },
              {
                label: 'もっと近くに',
                items: [
                  { label: '笑顔が固定', cls: 'glitch' },
                  { label: '立ち去る', action: 'wake' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    label: 'Special',
    items: [
      'Empty Trash',
      { label: 'Erase Disk...', action: 'eraseDisk' },
      '-',
      { label: 'Restart', action: 'restart' },
      { label: 'Shut Down', action: 'shutDown' },
      '-',
      {
        label: 'The Hallway',
        items: [
          { label: "It wasn't there yesterday", cls: 'dim' },
          {
            label: 'Measure it',
            items: [
              '3.5 m',
              {
                label: '3.7 m',
                items: [
                  { label: 'Interior exceeds exterior', cls: 'dim' },
                  {
                    label: 'Measure again',
                    items: [
                      '4.1 m',
                      {
                        label: '∞ m',
                        items: [
                          { label: 'Nail it shut', action: 'wake' },
                          {
                            label: 'Go in',
                            items: [
                              {
                                label: 'Flashlight: 62%',
                                items: [
                                  {
                                    label: 'The corridor',
                                    items: [
                                      { label: 'Colder here', cls: 'dim' },
                                      {
                                        label: 'Doors',
                                        items: [
                                          {
                                            label: 'Left door',
                                            items: [
                                              { label: 'Empty room', cls: 'dim' },
                                              {
                                                label: 'The same hallway',
                                                items: [
                                                  { label: "You've been here", cls: 'dim' },
                                                  {
                                                    label: 'Keep going',
                                                    items: [
                                                      { label: 'T̷h̷e̷ ̷w̷a̷l̷l̷s̷ ̷m̷o̷v̷e̷d̷', cls: 'glitch' },
                                                      {
                                                        label: "It knows you're here",
                                                        items: [
                                                          {
                                                            label: 'Run',
                                                            items: [
                                                              {
                                                                label: 'Faster',
                                                                items: [
                                                                  {
                                                                    label: 'F̸A̸S̸T̸E̸R̸',
                                                                    cls: 'glitch',
                                                                    items: [
                                                                      {
                                                                        label: 'EXIT SIGN',
                                                                        items: [
                                                                          { label: 'Wake up', action: 'wake' },
                                                                          { label: "It's not an exit", action: 'staticBlast', cls: 'glitch' },
                                                                        ],
                                                                      },
                                                                    ],
                                                                  },
                                                                ],
                                                              },
                                                            ],
                                                          },
                                                          {
                                                            label: 'Hide',
                                                            items: [
                                                              { label: 'It waits', cls: 'dim' },
                                                              { label: 'So do you', cls: 'dim' },
                                                            ],
                                                          },
                                                          {
                                                            label: 'Turn around',
                                                            items: [
                                                              { label: 'The way back is longer', cls: 'dim' },
                                                              {
                                                                label: 'Walk',
                                                                items: [
                                                                  {
                                                                    label: 'Walk',
                                                                    items: [
                                                                      {
                                                                        label: 'Walk',
                                                                        items: [
                                                                          {
                                                                            label: 'A door. Your door.',
                                                                            items: [
                                                                              { label: 'Open it', action: 'wake' },
                                                                              { label: '▓▓▓▓▓▓', action: 'staticBlast', cls: 'glitch' },
                                                                            ],
                                                                          },
                                                                        ],
                                                                      },
                                                                    ],
                                                                  },
                                                                ],
                                                              },
                                                            ],
                                                          },
                                                        ],
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                            ],
                                          },
                                          {
                                            label: 'Right door',
                                            items: [
                                              {
                                                label: 'Staircase',
                                                items: [
                                                  {
                                                    label: 'Down',
                                                    items: [
                                                      { label: 'Five minutes', cls: 'dim' },
                                                      {
                                                        label: 'Five days',
                                                        items: [
                                                          { label: 'Still going down', cls: 'dim' },
                                                          { label: 'The dark eats the light', cls: 'glitch' },
                                                        ],
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                            ],
                                          },
                                          { label: 'There were three doors', cls: 'glitch' },
                                        ],
                                      },
                                      {
                                        label: 'Drop a coin',
                                        items: [
                                          {
                                            label: 'Listen',
                                            items: [
                                              { label: 'No sound', cls: 'dim' },
                                              { label: 'No floor', cls: 'glitch' },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                  { label: 'Battery: 9%', cls: 'glitch' },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }
    ],
  },
];

//=========================================================================
// DROPDOWN ENGINE -- click a title to open, hover to wander, the corridor
// folds shut behind you as you drift back. Escape or any leaf click wakes
// the whole thing up. Submenus flip direction at the viewport edge (the
// hallway turns back on itself rather than end).
//=========================================================================
export function initMenus(actions) {
  const bar = document.querySelector('.osmenubar');
  if (!bar) return;
  const titles = [...bar.querySelectorAll('.mi[data-menu]')];
  let openTitle = null;

  function buildDrop(items) {
    const drop = document.createElement('div');
    drop.className = 'menu-drop';
    for (const raw of items) {
      if (raw === '-') {
        const sep = document.createElement('div');
        sep.className = 'menu-sep';
        drop.appendChild(sep);
        continue;
      }
      const def = typeof raw === 'string' ? { label: raw } : raw;
      const item = document.createElement('div');
      item.className = 'menu-item' + (def.cls ? ' ' + def.cls : '');
      item.textContent = def.label;
      if (def.items) {
        item.classList.add('has-sub');
        const sub = buildDrop(def.items);
        item.appendChild(sub);
        item.addEventListener('mouseenter', () => {
          foldSiblings(item);
          // Fold anything deeper than this level -- retreat closes corridors
          for (const d of item.querySelectorAll('.menu-item.open')) d.classList.remove('open');
          item.classList.add('open');
          placeSub(item, sub);
        });
      } else {
        item.addEventListener('mouseenter', () => foldSiblings(item));
        item.addEventListener('click', e => {
          e.stopPropagation();
          blinkThen(item, () => {
            if (def.action && actions[def.action]) actions[def.action]();
            closeAll();
          });
        });
      }
      drop.appendChild(item);
    }
    return drop;
  }

  // Collapse an item's sibling branches, including anything open inside them
  function foldSiblings(item) {
    for (const sib of item.parentElement.children) {
      if (sib === item) continue;
      sib.classList.remove('open');
      for (const d of sib.querySelectorAll('.menu-item.open')) d.classList.remove('open');
    }
  }

  // Open rightward by default; fold back left at the viewport edge, and
  // never let a corridor run off the bottom of the screen
  // Fixed-position placement computed from the parent item's rect, so a
  // corridor 50 levels deep never marches off the screen: each submenu
  // opens to whichever side has room and BOUNCES off both walls, zig-
  // zagging back across the viewport. Vertically it clamps to stay visible.
  function placeSub(item, sub) {
    const pad = 6;
    const vw = window.innerWidth, vh = window.innerHeight;
    // Measure with a neutral position first
    sub.style.left = '0px';
    sub.style.top = '0px';
    const sw = sub.offsetWidth, sh = sub.offsetHeight;
    const r = item.getBoundingClientRect();

    // Horizontal: prefer opening right of the item; if that overflows, open
    // left; if BOTH overflow (very deep), pick the side with more room and
    // clamp so it stays on-screen (slight overlap with the parent is fine).
    const roomRight = vw - r.right, roomLeft = r.left;
    let x;
    if (roomRight >= sw + pad) x = r.right - 1;
    else if (roomLeft >= sw + pad) x = r.left - sw + 1;
    else x = roomRight >= roomLeft ? vw - sw - pad : pad;
    x = Math.max(pad, Math.min(x, vw - sw - pad));

    // Vertical: line up with the item, clamp within the viewport
    let y = r.top - 1;
    y = Math.max(pad, Math.min(y, vh - sh - pad));

    sub.style.left = `${Math.round(x)}px`;
    sub.style.top = `${Math.round(y)}px`;
  }

  // Classic Mac menu blink before committing
  function blinkThen(item, fn) {
    item.classList.add('blink');
    setTimeout(() => { item.classList.remove('blink'); fn(); }, 260);
  }

  function closeAll() {
    if (openTitle) openTitle.classList.remove('open');
    openTitle = null;
    for (const el of bar.querySelectorAll('.menu-item.open')) el.classList.remove('open');
  }

  function openMenu(title) {
    if (openTitle === title) return;
    closeAll();
    openTitle = title;
    title.classList.add('open');
  }

  for (const title of titles) {
    const def = MENU_DEFS.find(m => m.label === title.dataset.menu);
    if (!def) continue;
    title.appendChild(buildDrop(def.items));
    title.addEventListener('click', e => {
      e.stopPropagation();
      if (openTitle === title) closeAll();
      else openMenu(title);
    });
    title.addEventListener('mouseenter', () => {
      if (openTitle) openMenu(title);   // slide along the bar like real System 7
    });
  }

  document.addEventListener('click', closeAll);
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
}
