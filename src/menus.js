// =========================================================================
// THE MENUS -- File / Edit / View / こんにちは / Special
//
// They start as System 7 menus. They do not stay System 7 menus.
// Somewhere past the third submenu the architecture stops agreeing with
// itself (the interior of this menu bar exceeds its exterior). Hover to
// descend; drift back a level and the corridor folds shut behind you --
// backtracking is always one hover away. Nothing here is load-bearing.
// =========================================================================

// Item shapes:
//   'label'                          plain item (inert; blinks and closes)
//   '-'                              separator
//   { label, items: [...] }         submenu
//   { label, action: 'name' }       wired leaf (see ACTIONS in initMenus)
//   { label, cls: 'dim'|'glitch' }  styling: narration / corruption

export const MENU_DEFS = [
  {
    label: 'File',
    items: [
      { label: 'New Scene', action: 'randomize' },
      {
        label: 'Open Recent',
        items: [
          'untitled-vaporwave.psd',
          'sunset_FINAL_v2.psd',
          'sunset_FINAL_FINAL.psd',
          '-',
          {
            label: 'do_not_open.psd',
            items: [
              { label: "It's empty.", cls: 'dim' },
              {
                label: "It's not empty",
                items: [
                  { label: 'A single pixel', cls: 'dim' },
                  {
                    label: "It's looking at you",
                    items: [
                      { label: 'Look away', action: 'wake' },
                      {
                        label: 'Look closer',
                        items: [
                          { label: 'It blinked', cls: 'glitch' },
                          {
                            label: 'Delete it',
                            items: [
                              { label: 'File in use', cls: 'dim' },
                              {
                                label: 'In use by what?',
                                items: [
                                  { label: 'By you.', cls: 'dim' },
                                  {
                                    label: 'By the other you',
                                    items: [
                                      { label: 'Trade places', action: 'staticBlast', cls: 'glitch' },
                                      { label: 'Close the file', action: 'wake' },
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
      'Close',
      '-',
      {
        label: 'Quit',
        items: [{ label: 'You are already gone', cls: 'dim' }],
      },
    ],
  },
  {
    label: 'Edit',
    items: [
      'Undo',
      'Redo',
      '-',
      'Cut',
      'Copy',
      'Paste',
      {
        label: 'Paste Reality',
        items: [
          {
            label: 'Which one?',
            items: [
              'This one',
              {
                label: 'The previous one',
                items: [
                  { label: 'Checksum mismatch', cls: 'dim' },
                  {
                    label: 'Force paste',
                    items: [
                      { label: 'R̶E̶A̶L̶I̶T̶Y̶ ̶P̶A̶S̶T̶E̶D̶', action: 'staticBlast', cls: 'glitch' },
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
    label: 'View',
    items: [
      'by Icon',
      'by Name',
      'by Date',
      '-',
      {
        label: 'by Dream',
        items: [
          'Shallow',
          {
            label: 'REM',
            items: [
              {
                label: 'Deeper',
                items: [
                  {
                    label: 'Lucid',
                    items: [
                      { label: 'You can see the menu', cls: 'dim' },
                      { label: 'The menu can see you', cls: 'glitch' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      'Clean Up Desktop',
    ],
  },
  {
    label: 'こんにちは',
    items: [
      { label: 'いらっしゃいませ', cls: 'dim' },
      { label: '見る', action: 'kanji' },
      '-',
      {
        label: 'The Mall',
        items: [
          { label: 'OPEN 24 HRS (dark inside)', cls: 'dim' },
          {
            label: 'Directory',
            items: [
              {
                label: 'Food Court',
                items: [
                  { label: 'Orange Julius (closed)', cls: 'dim' },
                  { label: 'Sbarro (closed)', cls: 'dim' },
                  {
                    label: 'The Fountain',
                    items: [
                      { label: "Dry since '94", cls: 'dim' },
                      {
                        label: 'Throw a coin',
                        items: [
                          { label: 'Wish: go home', action: 'wake' },
                          {
                            label: 'Wish: stay forever',
                            items: [
                              { label: 'Granted.', action: 'staticBlast', cls: 'glitch' },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                label: 'Music Store',
                items: [
                  {
                    label: 'Cassettes',
                    items: [
                      { label: '曲: PLASTIC LOVE', cls: 'dim' },
                      {
                        label: 'Play it backwards',
                        items: [{ label: 'It plays you', cls: 'glitch' }],
                      },
                    ],
                  },
                ],
              },
              {
                label: 'Level 0',
                items: [
                  {
                    label: 'Yellow rooms',
                    items: [
                      {
                        label: 'The hum',
                        items: [
                          {
                            label: 'Follow it',
                            items: [
                              {
                                label: 'Louder now',
                                items: [
                                  {
                                    label: 'Fluorescent shrine',
                                    items: [
                                      'Kneel',
                                      {
                                        label: 'Unscrew the bulb',
                                        items: [
                                          { label: 'Darkness', action: 'sunOff', cls: 'glitch' },
                                          { label: 'Put it back', action: 'wake' },
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
                  { label: 'Moist carpet', cls: 'dim' },
                  {
                    label: 'Exit?',
                    items: [
                      { label: 'There is no exit', cls: 'dim' },
                      {
                        label: 'There is one exit',
                        items: [
                          { label: 'Behind you', cls: 'dim' },
                          {
                            label: "It's a menu",
                            items: [
                              { label: 'This menu', cls: 'dim' },
                              { label: 'Wake up', action: 'wake' },
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
    label: 'Special',
    items: [
      'Empty Trash',
      'Erase Disk…',
      '-',
      'Restart',
      'Shut Down',
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
      },
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
  function placeSub(item, sub) {
    sub.classList.remove('flip');
    sub.style.top = '-1px';
    const r = sub.getBoundingClientRect();
    if (r.right > window.innerWidth - 8) sub.classList.add('flip');
    const r2 = sub.getBoundingClientRect();
    const over = r2.bottom - (window.innerHeight - 8);
    if (over > 0) sub.style.top = `${-1 - over}px`;
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
