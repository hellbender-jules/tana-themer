// ==UserScript==
// @name         Tana Themer
// @namespace    https://tana.inc/
// @version      1.1.0
// @description  Custom themes for Tana — Nord, Catppuccin, Rosé Pine, Warm Sepia, CoffeeBuddy, Charcoal
// @author       Julian
// @match        https://app.tana.inc/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  // ============================================================
  // THEMES
  //
  // To add a new theme:
  //   1. Copy an existing entry and give it a new unique `id`
  //   2. Set `mode` to 'light' or 'dark'
  //   3. Set `preview` to [background, accent, text] hex colors for the picker swatch
  //   4. Override any CSS variables in `vars`
  //
  // Key variables (full list below the themes):
  //   Background:  --colorPanelBackground, --colorPanelBackgroundDimmed,
  //                --colorNavigationAltPanelBackground, --colorUIContextMenuBackground
  //   Text:        --colorEditorText, --colorEditorTextHighlight, --colorEditorTextMuted,
  //                --colorUIText, --colorUITextMuted
  //   Accent:      --colorLink, --colorFocus, --colorFocusWithin, --colorSelected
  //   Borders:     --colorUIStroke, --colorUIStrokeSoft, --colorBulletDefaultFill
  //   Code:        --inlineCode, --inlineCodeBackground
  // ============================================================

  const THEMES = {

    // ── Tana defaults (no overrides — just switches mode) ────────────────────
    'tana-light': {
      id: 'tana-light',
      name: 'Tana Light',
      mode: 'light',
      preview: ['#ffffff', '#297dd9', '#33343e'],
      vars: {},
    },

    'tana-dark': {
      id: 'tana-dark',
      name: 'Tana Dark',
      mode: 'dark',
      preview: ['#1c1d22', '#297dd9', '#c9c8d4'],
      vars: {},
    },

    // ── Nord ─────────────────────────────────────────────────────────────────
    // Arctic, north-bluish color palette. Dark, cool, minimal.
    'nord': {
      id: 'nord',
      name: 'Nord',
      mode: 'dark',
      preview: ['#2e3440', '#88c0d0', '#d8dee9'],
      vars: {
        '--colorPanelBackground':                '#2e3440',
        '--colorPanelBackgroundDimmed':          '#3b4252',
        '--colorPanelBackgroundHighlighted':     '#434c5e',
        '--colorPanelBackgroundTransparent':     'rgba(46,52,64,0)',
        '--colorNavigationAltPanelBackground':   '#3b4252',
        '--colorUIContextMenuBackground':        '#3b4252',
        '--colorCanvasBackground':               '#272c36',

        '--colorEditorText':                     '#d8dee9',
        '--colorEditorTextHighlight':            '#eceff4',
        '--colorEditorTextMuted':                '#8b98b3',
        '--colorUIText':                         '#9aa8c0',
        '--colorUITextMuted':                    '#6d7a90',
        '--colorUITextDisabled':                 '#4f5a6b',
        '--colorUITextOnHighlight':              '#eceff4',

        '--colorLink':                           '#88c0d0',
        '--colorLinkMuted':                      '#81a1c1',
        '--colorHoverLink':                      '#eceff4',
        '--colorFocus':                          '#88c0d0',
        '--colorFocusInactive':                  '#4c566a',
        '--colorFocusWithin':                    '#5e81ac',
        '--colorFocusText':                      '#81a1c1',

        '--colorSelected':                       '#3b4252',
        '--colorSelectedUnfocused':              '#434c5e',
        '--colorTextSelectedUnfocused':          '#4c566a',
        '--colorTextHighlightedBackground':      '#3d4a5c',

        '--colorUIStroke':                       '#4c566a',
        '--colorUIStrokeSoft':                   '#3b4252',
        '--colorUIStrokeHover':                  '#5e6e82',
        '--colorUITupleStroke':                  '#3b4252',
        '--colorUIListItemHovered':              '#434c5e',

        '--colorBulletDefaultFill':              '#5e81ac',
        '--colorBulletDefaultOutline':           '#4c566a',
        '--colorBulletExpandLine':               '#3b4252',
        '--colorBulletExpandLineSelected':       '#434c5e',
        '--colorBulletExpandLineReference':      '#313847',
        '--colorBulletExpandLineHoverBackground':'#434c5e',

        '--colorNavigationCardBackgroundOpen':   '#434c5e',
        '--colorNavigationCardStroke':           '#3b4252',
        '--colorSidebarItemHoverBackground':     '#434c5e',
        '--colorSidebarFadeColor':               '#2e3440',
        '--colorSidebarItemHoverText':           '#eceff4',

        '--colorTooltipBackground':              '#4c566a',
        '--colorTooltipText':                    '#d8dee9',

        '--inlineCode':                          '#a3be8c',
        '--inlineCodeBackground':                '#232830',

        '--scrollbarForeground':                 'rgba(136,192,208,0.2)',
        '--scrollbarForegroundHover':            'rgba(136,192,208,0.4)',
        '--scrollbarForegroundActive':           'rgba(136,192,208,0.6)',

        '--shadowSoft':                          '0px 0.1rem 0.1rem rgba(0,0,0,0.2), 0px 0.75rem 1.5rem rgba(0,0,0,0.3)',
        '--shadowHard':                          '0px 0.1rem 0.1rem rgba(0,0,0,0.25)',

        '--colorButtonNeutralBackground':        '#3b4252',
        '--colorButtonNeutralStroke':            '#4c566a',
        '--colorButtonNeutralText':              '#9aa8c0',
        '--colorButtonNeutralHoverBackground':   '#434c5e',
      },
    },

    // ── Catppuccin Mocha ─────────────────────────────────────────────────────
    // Warm, pastel dark theme. Soothing purples and blues.
    'catppuccin-mocha': {
      id: 'catppuccin-mocha',
      name: 'Catppuccin Mocha',
      mode: 'dark',
      preview: ['#1e1e2e', '#cba6f7', '#cdd6f4'],
      vars: {
        '--colorPanelBackground':                '#1e1e2e',
        '--colorPanelBackgroundDimmed':          '#181825',
        '--colorPanelBackgroundHighlighted':     '#313244',
        '--colorPanelBackgroundTransparent':     'rgba(30,30,46,0)',
        '--colorNavigationAltPanelBackground':   '#181825',
        '--colorUIContextMenuBackground':        '#313244',
        '--colorCanvasBackground':               '#11111b',

        '--colorEditorText':                     '#cdd6f4',
        '--colorEditorTextHighlight':            '#e6e9f0',
        '--colorEditorTextMuted':                '#a6adc8',
        '--colorUIText':                         '#bac2de',
        '--colorUITextMuted':                    '#9399b2',
        '--colorUITextDisabled':                 '#585b70',
        '--colorUITextOnHighlight':              '#cdd6f4',

        '--colorLink':                           '#89b4fa',
        '--colorLinkMuted':                      '#74c7ec',
        '--colorHoverLink':                      '#cdd6f4',
        '--colorFocus':                          '#cba6f7',
        '--colorFocusInactive':                  '#45475a',
        '--colorFocusWithin':                    '#7287fd',
        '--colorFocusText':                      '#89b4fa',

        '--colorSelected':                       '#313244',
        '--colorSelectedUnfocused':              '#45475a',
        '--colorTextSelectedUnfocused':          '#585b70',
        '--colorTextHighlightedBackground':      '#45475a',

        '--colorUIStroke':                       '#45475a',
        '--colorUIStrokeSoft':                   '#313244',
        '--colorUIStrokeHover':                  '#585b70',
        '--colorUITupleStroke':                  '#313244',
        '--colorUIListItemHovered':              '#313244',

        '--colorBulletDefaultFill':              '#cba6f7',
        '--colorBulletDefaultOutline':           '#45475a',
        '--colorBulletExpandLine':               '#313244',
        '--colorBulletExpandLineSelected':       '#45475a',
        '--colorBulletExpandLineReference':      '#1e1e2e',
        '--colorBulletExpandLineHoverBackground':'#313244',

        '--colorNavigationCardBackgroundOpen':   '#45475a',
        '--colorNavigationCardStroke':           '#313244',
        '--colorSidebarItemHoverBackground':     '#313244',
        '--colorSidebarFadeColor':               '#1e1e2e',
        '--colorSidebarItemHoverText':           '#e6e9f0',

        '--colorTooltipBackground':              '#45475a',
        '--colorTooltipText':                    '#cdd6f4',

        '--inlineCode':                          '#f38ba8',
        '--inlineCodeBackground':                '#181825',

        '--scrollbarForeground':                 'rgba(203,166,247,0.2)',
        '--scrollbarForegroundHover':            'rgba(203,166,247,0.4)',
        '--scrollbarForegroundActive':           'rgba(203,166,247,0.6)',

        '--shadowSoft':                          '0px 0.1rem 0.1rem rgba(0,0,0,0.3), 0px 0.75rem 1.5rem rgba(0,0,0,0.4)',
        '--shadowHard':                          '0px 0.1rem 0.1rem rgba(0,0,0,0.3)',

        '--colorButtonNeutralBackground':        '#313244',
        '--colorButtonNeutralStroke':            '#45475a',
        '--colorButtonNeutralText':              '#bac2de',
        '--colorButtonNeutralHoverBackground':   '#45475a',
      },
    },

    // ── Rosé Pine ────────────────────────────────────────────────────────────
    // All natural pine, faux fur and a bit of soho vibes.
    'rose-pine': {
      id: 'rose-pine',
      name: 'Rosé Pine',
      mode: 'dark',
      preview: ['#191724', '#ebbcba', '#e0def4'],
      vars: {
        '--colorPanelBackground':                '#191724',
        '--colorPanelBackgroundDimmed':          '#1f1d2e',
        '--colorPanelBackgroundHighlighted':     '#26233a',
        '--colorPanelBackgroundTransparent':     'rgba(25,23,36,0)',
        '--colorNavigationAltPanelBackground':   '#1f1d2e',
        '--colorUIContextMenuBackground':        '#26233a',
        '--colorCanvasBackground':               '#16141f',

        '--colorEditorText':                     '#e0def4',
        '--colorEditorTextHighlight':            '#e0def4',
        '--colorEditorTextMuted':                '#908caa',
        '--colorUIText':                         '#9e9bb4',
        '--colorUITextMuted':                    '#6e6a86',
        '--colorUITextDisabled':                 '#524f67',
        '--colorUITextOnHighlight':              '#e0def4',

        '--colorLink':                           '#9ccfd8',
        '--colorLinkMuted':                      '#31748f',
        '--colorHoverLink':                      '#e0def4',
        '--colorFocus':                          '#ebbcba',
        '--colorFocusInactive':                  '#403d52',
        '--colorFocusWithin':                    '#c4a7e7',
        '--colorFocusText':                      '#9ccfd8',

        '--colorSelected':                       '#26233a',
        '--colorSelectedUnfocused':              '#2a273f',
        '--colorTextSelectedUnfocused':          '#403d52',
        '--colorTextHighlightedBackground':      '#2a273f',

        '--colorUIStroke':                       '#403d52',
        '--colorUIStrokeSoft':                   '#26233a',
        '--colorUIStrokeHover':                  '#524f67',
        '--colorUITupleStroke':                  '#26233a',
        '--colorUIListItemHovered':              '#26233a',

        '--colorBulletDefaultFill':              '#ebbcba',
        '--colorBulletDefaultOutline':           '#403d52',
        '--colorBulletExpandLine':               '#26233a',
        '--colorBulletExpandLineSelected':       '#403d52',
        '--colorBulletExpandLineReference':      '#1f1d2e',
        '--colorBulletExpandLineHoverBackground':'#26233a',

        '--colorNavigationCardBackgroundOpen':   '#2a273f',
        '--colorNavigationCardStroke':           '#26233a',
        '--colorSidebarItemHoverBackground':     '#26233a',
        '--colorSidebarFadeColor':               '#191724',
        '--colorSidebarItemHoverText':           '#e0def4',

        '--colorTooltipBackground':              '#403d52',
        '--colorTooltipText':                    '#e0def4',

        '--inlineCode':                          '#eb6f92',
        '--inlineCodeBackground':                '#1f1d2e',

        '--scrollbarForeground':                 'rgba(235,188,186,0.2)',
        '--scrollbarForegroundHover':            'rgba(235,188,186,0.4)',
        '--scrollbarForegroundActive':           'rgba(235,188,186,0.6)',

        '--shadowSoft':                          '0px 0.1rem 0.1rem rgba(0,0,0,0.3), 0px 0.75rem 1.5rem rgba(0,0,0,0.4)',
        '--shadowHard':                          '0px 0.1rem 0.1rem rgba(0,0,0,0.3)',

        '--colorButtonNeutralBackground':        '#26233a',
        '--colorButtonNeutralStroke':            '#403d52',
        '--colorButtonNeutralText':              '#9e9bb4',
        '--colorButtonNeutralHoverBackground':   '#2a273f',
      },
    },

    // ── Warm Sepia ───────────────────────────────────────────────────────────
    // Warm parchment tones for comfortable long-form writing.
    'warm-sepia': {
      id: 'warm-sepia',
      name: 'Warm Sepia',
      mode: 'light',
      preview: ['#f4ece3', '#9e5a3c', '#3d2b1f'],
      vars: {
        '--colorPanelBackground':                '#f4ece3',
        '--colorPanelBackgroundDimmed':          '#ede4db',
        '--colorPanelBackgroundHighlighted':     '#e8dfd4',
        '--colorPanelBackgroundTransparent':     'rgba(244,236,227,0)',
        '--colorNavigationAltPanelBackground':   '#ede4db',
        '--colorUIContextMenuBackground':        '#faf6f2',
        '--colorCanvasBackground':               '#ede4db',

        '--colorEditorText':                     '#3d2b1f',
        '--colorEditorTextHighlight':            '#2a1a10',
        '--colorEditorTextMuted':                '#7a6454',
        '--colorUIText':                         '#6a5446',
        '--colorUITextMuted':                    '#927a6a',
        '--colorUITextDisabled':                 '#baa898',
        '--colorUITextOnHighlight':              '#3d2b1f',

        '--colorLink':                           '#9e5a3c',
        '--colorLinkMuted':                      '#b57a5a',
        '--colorHoverLink':                      '#2a1a10',
        '--colorFocus':                          '#c06840',
        '--colorFocusInactive':                  '#c4b49a',
        '--colorFocusWithin':                    '#d4a070',
        '--colorFocusText':                      '#9e5a3c',

        '--colorSelected':                       '#e8dfd4',
        '--colorSelectedUnfocused':              '#ddd4c8',
        '--colorTextSelectedUnfocused':          '#c4b49a',
        '--colorTextHighlightedBackground':      '#f0d4b0',

        '--colorUIStroke':                       '#c4b49a',
        '--colorUIStrokeSoft':                   '#d8cfc4',
        '--colorUIStrokeHover':                  '#a89a84',
        '--colorUITupleStroke':                  '#ddd4c8',
        '--colorUIListItemHovered':              '#ddd4c8',

        '--colorBulletDefaultFill':              '#9e5a3c',
        '--colorBulletDefaultOutline':           '#c4b49a',
        '--colorBulletExpandLine':               '#ddd4c8',
        '--colorBulletExpandLineSelected':       '#d0c7bc',
        '--colorBulletExpandLineReference':      '#e8dfd4',
        '--colorBulletExpandLineHoverBackground':'#ddd4c8',

        '--colorNavigationCardBackgroundOpen':   '#ddd4c8',
        '--colorNavigationCardStroke':           '#c4b49a',
        '--colorSidebarItemHoverBackground':     '#ddd4c8',
        '--colorSidebarFadeColor':               '#f4ece3',
        '--colorSidebarItemHoverText':           '#2a1a10',

        '--colorTooltipBackground':              '#6a5446',
        '--colorTooltipText':                    '#f4ece3',

        '--inlineCode':                          '#8b4513',
        '--inlineCodeBackground':                '#e8dfd4',

        '--scrollbarForeground':                 'rgba(158,90,60,0.15)',
        '--scrollbarForegroundHover':            'rgba(158,90,60,0.3)',
        '--scrollbarForegroundActive':           'rgba(158,90,60,0.45)',

        '--shadowSoft':                          '0px 0.1rem 0.1rem rgba(0,0,0,0.04), 0px 0.75rem 1.5rem rgba(0,0,0,0.07)',
        '--shadowHard':                          '0px 0.1rem 0.1rem rgba(0,0,0,0.06)',

        '--colorButtonNeutralBackground':        '#ede4db',
        '--colorButtonNeutralStroke':            '#c4b49a',
        '--colorButtonNeutralText':              '#6a5446',
        '--colorButtonNeutralHoverBackground':   '#e8dfd4',
      },
    },

    // ── CoffeeBuddy Professional ─────────────────────────────────────────────
    // Warm parchment and coffee browns. Light, focused, professional.
    // Sourced from the NotePlan CoffeeBuddy-Professional theme.
    'coffee-professional': {
      id: 'coffee-professional',
      name: 'CoffeeBuddy Pro',
      mode: 'light',
      preview: ['#FAF8F5', '#8B6F47', '#2C2420'],
      vars: {
        '--colorPanelBackground':                '#FAF8F5',
        '--colorPanelBackgroundDimmed':          '#F5F2ED',
        '--colorPanelBackgroundHighlighted':     '#EDE8E0',
        '--colorPanelBackgroundTransparent':     'rgba(250,248,245,0)',
        '--colorNavigationAltPanelBackground':   '#F0EBE3',
        '--colorUIContextMenuBackground':        '#F8F5F0',
        '--colorCanvasBackground':               '#EDE8E0',

        '--colorEditorText':                     '#3A3230',
        '--colorEditorTextHighlight':            '#2C2420',
        '--colorEditorTextMuted':                '#7A5C42',
        '--colorUIText':                         '#5C4033',
        '--colorUITextMuted':                    '#8B6F47',
        '--colorUITextDisabled':                 '#C4AE96',
        '--colorUITextOnHighlight':              '#2C2420',

        '--colorLink':                           '#8B6F47',
        '--colorLinkMuted':                      '#A68860',
        '--colorHoverLink':                      '#2C2420',
        '--colorFocus':                          '#8B6F47',
        '--colorFocusInactive':                  '#D4C0A8',
        '--colorFocusWithin':                    '#C4A880',
        '--colorFocusText':                      '#5C4033',

        '--colorSelected':                       '#EDE8E0',
        '--colorSelectedUnfocused':              '#E8E0D4',
        '--colorTextSelectedUnfocused':          '#D4C0A8',
        '--colorTextHighlightedBackground':      '#F4E4C8',

        '--colorUIStroke':                       '#D4BFA8',
        '--colorUIStrokeSoft':                   '#E8E0D4',
        '--colorUIStrokeHover':                  '#B8A48C',
        '--colorUITupleStroke':                  '#E8E0D4',
        '--colorUIListItemHovered':              '#EDE8E0',

        '--colorBulletDefaultFill':              '#8B6F47',
        '--colorBulletDefaultOutline':           '#D4BFA8',
        '--colorBulletExpandLine':               '#E8E0D4',
        '--colorBulletExpandLineSelected':       '#DDD4C8',
        '--colorBulletExpandLineReference':      '#EDE8E0',
        '--colorBulletExpandLineHoverBackground':'#DDD4C8',

        '--colorNavigationCardBackgroundOpen':   '#E8E0D4',
        '--colorNavigationCardStroke':           '#D4BFA8',
        '--colorSidebarItemHoverBackground':     '#EDE8E0',
        '--colorSidebarFadeColor':               '#FAF8F5',
        '--colorSidebarItemHoverText':           '#2C2420',

        '--colorTooltipBackground':              '#5C4033',
        '--colorTooltipText':                    '#FAF8F5',

        '--inlineCode':                          '#7A5C42',
        '--inlineCodeBackground':                '#F0EBE3',

        '--scrollbarForeground':                 'rgba(139,111,71,0.15)',
        '--scrollbarForegroundHover':            'rgba(139,111,71,0.3)',
        '--scrollbarForegroundActive':           'rgba(139,111,71,0.45)',

        '--shadowSoft':                          '0px 0.1rem 0.1rem rgba(44,36,32,0.04), 0px 0.75rem 1.5rem rgba(44,36,32,0.07)',
        '--shadowHard':                          '0px 0.1rem 0.1rem rgba(44,36,32,0.07)',

        '--colorButtonNeutralBackground':        '#EDE8E0',
        '--colorButtonNeutralStroke':            '#D4BFA8',
        '--colorButtonNeutralText':              '#5C4033',
        '--colorButtonNeutralHoverBackground':   '#E8E0D4',
      },
    },

    // ── CoffeeBuddy Dark ─────────────────────────────────────────────────────
    // Rich espresso darks with warm golden accents.
    // Sourced from the NotePlan CoffeeBuddy-Dark theme.
    'coffee-dark': {
      id: 'coffee-dark',
      name: 'CoffeeBuddy Dark',
      mode: 'dark',
      preview: ['#1A1512', '#D4A574', '#E8DCC8'],
      vars: {
        '--colorPanelBackground':                '#1A1512',
        '--colorPanelBackgroundDimmed':          '#221C18',
        '--colorPanelBackgroundHighlighted':     '#2A2420',
        '--colorPanelBackgroundTransparent':     'rgba(26,21,18,0)',
        '--colorNavigationAltPanelBackground':   '#221C18',
        '--colorUIContextMenuBackground':        '#2A231D',
        '--colorCanvasBackground':               '#130F0C',

        '--colorEditorText':                     '#E0D4C0',
        '--colorEditorTextHighlight':            '#F5E6D3',
        '--colorEditorTextMuted':                '#A88B70',
        '--colorUIText':                         '#C8A884',
        '--colorUITextMuted':                    '#907060',
        '--colorUITextDisabled':                 '#5A4535',
        '--colorUITextOnHighlight':              '#F5E6D3',

        '--colorLink':                           '#E8B87C',
        '--colorLinkMuted':                      '#D4A574',
        '--colorHoverLink':                      '#F5E6D3',
        '--colorFocus':                          '#D4A574',
        '--colorFocusInactive':                  '#4A3828',
        '--colorFocusWithin':                    '#A87845',
        '--colorFocusText':                      '#E8B87C',

        '--colorSelected':                       '#2A231D',
        '--colorSelectedUnfocused':              '#3D3228',
        '--colorTextSelectedUnfocused':          '#4A3828',
        '--colorTextHighlightedBackground':      '#3D3020',

        '--colorUIStroke':                       '#4A3828',
        '--colorUIStrokeSoft':                   '#2A231D',
        '--colorUIStrokeHover':                  '#6A5040',
        '--colorUITupleStroke':                  '#2A231D',
        '--colorUIListItemHovered':              '#2A2420',

        '--colorBulletDefaultFill':              '#D4A574',
        '--colorBulletDefaultOutline':           '#4A3828',
        '--colorBulletExpandLine':               '#2A231D',
        '--colorBulletExpandLineSelected':       '#3D3228',
        '--colorBulletExpandLineReference':      '#1A1512',
        '--colorBulletExpandLineHoverBackground':'#2A231D',

        '--colorNavigationCardBackgroundOpen':   '#3D3228',
        '--colorNavigationCardStroke':           '#2A231D',
        '--colorSidebarItemHoverBackground':     '#2A2420',
        '--colorSidebarFadeColor':               '#1A1512',
        '--colorSidebarItemHoverText':           '#F5E6D3',

        '--colorTooltipBackground':              '#3D3228',
        '--colorTooltipText':                    '#E8DCC8',

        '--inlineCode':                          '#E8A87C',
        '--inlineCodeBackground':                '#2A231D',

        '--scrollbarForeground':                 'rgba(212,165,116,0.2)',
        '--scrollbarForegroundHover':            'rgba(212,165,116,0.4)',
        '--scrollbarForegroundActive':           'rgba(212,165,116,0.6)',

        '--shadowSoft':                          '0px 0.1rem 0.1rem rgba(0,0,0,0.25), 0px 0.75rem 1.5rem rgba(0,0,0,0.4)',
        '--shadowHard':                          '0px 0.1rem 0.1rem rgba(0,0,0,0.3)',

        '--colorButtonNeutralBackground':        '#2A231D',
        '--colorButtonNeutralStroke':            '#4A3828',
        '--colorButtonNeutralText':              '#C8A884',
        '--colorButtonNeutralHoverBackground':   '#3D3228',
      },
    },

    // ── Charcoal Squashed ────────────────────────────────────────────────────
    // Cool neutral charcoal with yellow-green and cyan pops.
    // Sourced from the NotePlan Charcoal Squashed theme.
    'charcoal-squashed': {
      id: 'charcoal-squashed',
      name: 'Charcoal Squashed',
      mode: 'dark',
      preview: ['#2E3235', '#D3DB90', '#E1E3E2'],
      vars: {
        '--colorPanelBackground':                '#2E3235',
        '--colorPanelBackgroundDimmed':          '#353A3D',
        '--colorPanelBackgroundHighlighted':     '#3D4245',
        '--colorPanelBackgroundTransparent':     'rgba(46,50,53,0)',
        '--colorNavigationAltPanelBackground':   '#272B2E',
        '--colorUIContextMenuBackground':        '#3D4245',
        '--colorCanvasBackground':               '#262A2C',

        '--colorEditorText':                     '#E1E3E2',
        '--colorEditorTextHighlight':            '#EAECED',
        '--colorEditorTextMuted':                '#9AA0A3',
        '--colorUIText':                         '#ABACAF',
        '--colorUITextMuted':                    '#787E81',
        '--colorUITextDisabled':                 '#555A5D',
        '--colorUITextOnHighlight':              '#E1E3E2',

        '--colorLink':                           '#D3DB90',
        '--colorLinkMuted':                      '#B0B870',
        '--colorHoverLink':                      '#EAECED',
        '--colorFocus':                          '#D3DB90',
        '--colorFocusInactive':                  '#464A4D',
        '--colorFocusWithin':                    '#00B9ED',
        '--colorFocusText':                      '#D3DB90',

        '--colorSelected':                       '#353A3D',
        '--colorSelectedUnfocused':              '#3D4245',
        '--colorTextSelectedUnfocused':          '#464A4D',
        '--colorTextHighlightedBackground':      '#3A5A6A',

        '--colorUIStroke':                       '#464A4D',
        '--colorUIStrokeSoft':                   '#353A3D',
        '--colorUIStrokeHover':                  '#5A6063',
        '--colorUITupleStroke':                  '#353A3D',
        '--colorUIListItemHovered':              '#3D4245',

        '--colorBulletDefaultFill':              '#D3DB90',
        '--colorBulletDefaultOutline':           '#464A4D',
        '--colorBulletExpandLine':               '#353A3D',
        '--colorBulletExpandLineSelected':       '#3D4245',
        '--colorBulletExpandLineReference':      '#2E3235',
        '--colorBulletExpandLineHoverBackground':'#3D4245',

        '--colorNavigationCardBackgroundOpen':   '#3D4245',
        '--colorNavigationCardStroke':           '#353A3D',
        '--colorSidebarItemHoverBackground':     '#3D4245',
        '--colorSidebarFadeColor':               '#2E3235',
        '--colorSidebarItemHoverText':           '#EAECED',

        '--colorTooltipBackground':              '#464A4D',
        '--colorTooltipText':                    '#E1E3E2',

        '--inlineCode':                          '#00B9ED',
        '--inlineCodeBackground':                '#272B2E',

        '--scrollbarForeground':                 'rgba(211,219,144,0.2)',
        '--scrollbarForegroundHover':            'rgba(211,219,144,0.4)',
        '--scrollbarForegroundActive':           'rgba(211,219,144,0.6)',

        '--shadowSoft':                          '0px 0.1rem 0.1rem rgba(0,0,0,0.2), 0px 0.75rem 1.5rem rgba(0,0,0,0.32)',
        '--shadowHard':                          '0px 0.1rem 0.1rem rgba(0,0,0,0.25)',

        '--colorButtonNeutralBackground':        '#353A3D',
        '--colorButtonNeutralStroke':            '#464A4D',
        '--colorButtonNeutralText':              '#ABACAF',
        '--colorButtonNeutralHoverBackground':   '#3D4245',
      },
    },

  };

  // ============================================================
  // STORAGE
  const STORAGE_KEY = 'tana-themer-active';

  // ============================================================
  // CSS INJECTION

  let styleEl = null;

  function buildCSS(theme) {
    if (!theme || !theme.vars || Object.keys(theme.vars).length === 0) return '';

    // We inject under BOTH mode selectors — Tana's mode class will determine
    // which one is active. Our class is appended for specificity so it wins
    // over Tana's own declarations without needing !important.
    const modeSelector = theme.mode === 'light' ? 'html.isLightMode' : 'html.isDarkMode';
    const themeClass   = `.tana-theme-${theme.id}`;
    const declarations = Object.entries(theme.vars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n');

    return `${modeSelector}${themeClass} {\n${declarations}\n}`;
  }

  function applyTheme(themeId) {
    const theme = THEMES[themeId];
    const html  = document.documentElement;

    // Remove all previous theme classes
    Object.keys(THEMES).forEach(id => html.classList.remove(`tana-theme-${id}`));

    // Tana's default themes just flip the mode class with no extra overrides
    if (!theme || Object.keys(theme.vars).length === 0) {
      if (themeId === 'tana-dark') {
        html.classList.remove('isLightMode');
        html.classList.add('isDarkMode');
      } else {
        html.classList.remove('isDarkMode');
        html.classList.add('isLightMode');
      }
      if (styleEl) styleEl.textContent = '';
      localStorage.setItem(STORAGE_KEY, themeId);
      return;
    }

    // Switch Tana's base mode class to match the theme's intended mode
    if (theme.mode === 'dark') {
      html.classList.remove('isLightMode');
      html.classList.add('isDarkMode');
    } else {
      html.classList.remove('isDarkMode');
      html.classList.add('isLightMode');
    }

    // Add our theme class (used in the injected CSS selector for specificity)
    html.classList.add(`tana-theme-${themeId}`);

    // Inject/update the style element
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'tana-themer-styles';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = buildCSS(theme);
    localStorage.setItem(STORAGE_KEY, themeId);
  }

  // ============================================================
  // PICKER UI

  function buildPickerHTML(activeId) {
    const items = Object.values(THEMES).map(t => {
      const swatches = (t.preview || ['#fff', '#888', '#000'])
        .map(c => `<span class="tt-swatch" style="background:${c}"></span>`)
        .join('');
      const active = t.id === activeId ? ' tt-active' : '';
      return `
        <div class="tt-item${active}" data-theme="${t.id}">
          <span class="tt-swatches">${swatches}</span>
          <span class="tt-name">${t.name}</span>
          <span class="tt-check">✓</span>
        </div>`;
    }).join('');

    return `
      <style>
        #tt-root {
          position: fixed;
          bottom: 1.25rem;
          right: 1.25rem;
          z-index: 99999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 13px;
        }
        #tt-btn {
          width: 2.1rem;
          height: 2.1rem;
          border-radius: 50%;
          background: var(--colorUIContextMenuBackground, #fff);
          border: 1.5px solid var(--colorUIStroke, #ddd);
          box-shadow: 0 2px 8px rgba(0,0,0,0.14);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
          user-select: none;
          line-height: 1;
        }
        #tt-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 14px rgba(0,0,0,0.2);
        }
        #tt-panel {
          display: none;
          position: absolute;
          bottom: 2.75rem;
          right: 0;
          background: var(--colorUIContextMenuBackground, #fff);
          border: 1px solid var(--colorUIStroke, #ddd);
          border-radius: 10px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.16);
          padding: 0.4rem;
          min-width: 13rem;
        }
        #tt-panel.tt-open {
          display: block;
          animation: tt-in 0.14s ease;
        }
        @keyframes tt-in {
          from { opacity: 0; transform: translateY(5px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .tt-label {
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--colorUITextMuted, #999);
          padding: 0.35rem 0.6rem 0.25rem;
        }
        .tt-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.38rem 0.6rem;
          border-radius: 6px;
          cursor: pointer;
          color: var(--colorEditorText, #333);
          transition: background 0.08s;
        }
        .tt-item:hover {
          background: var(--colorUIListItemHovered, rgba(0,0,0,0.06));
        }
        .tt-item.tt-active {
          background: var(--colorSelected, rgba(0,0,0,0.08));
        }
        .tt-swatches {
          display: flex;
          gap: 2px;
          flex-shrink: 0;
        }
        .tt-swatch {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.12);
          display: inline-block;
        }
        .tt-name { flex: 1; }
        .tt-check {
          opacity: 0;
          font-size: 0.75rem;
          color: var(--colorFocus, #297dd9);
        }
        .tt-item.tt-active .tt-check { opacity: 1; }
        .tt-divider {
          height: 1px;
          background: var(--colorUIStrokeSoft, #eee);
          margin: 0.3rem 0.5rem;
        }
      </style>

      <div id="tt-panel">
        <div class="tt-label">Theme</div>
        ${items}
      </div>
      <div id="tt-btn" title="Tana Themer">🎨</div>
    `;
  }

  function injectUI() {
    if (document.getElementById('tt-root')) return;
    if (!document.body) return;

    const activeId = localStorage.getItem(STORAGE_KEY) || 'tana-light';

    const root = document.createElement('div');
    root.id = 'tt-root';
    root.innerHTML = buildPickerHTML(activeId);
    document.body.appendChild(root);

    const btn   = root.querySelector('#tt-btn');
    const panel = root.querySelector('#tt-panel');

    btn.addEventListener('click', e => {
      e.stopPropagation();
      panel.classList.toggle('tt-open');
    });

    document.addEventListener('click', () => panel.classList.remove('tt-open'));

    root.querySelectorAll('.tt-item').forEach(item => {
      item.addEventListener('click', e => {
        e.stopPropagation();
        const themeId = item.dataset.theme;
        applyTheme(themeId);
        root.querySelectorAll('.tt-item').forEach(i => i.classList.remove('tt-active'));
        item.classList.add('tt-active');
        panel.classList.remove('tt-open');
      });
    });
  }

  // ============================================================
  // INIT

  // Apply saved theme as early as possible (before first paint where we can)
  function earlyApply() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES[saved] && Object.keys(THEMES[saved].vars).length > 0) {
      // We can't inject a <style> before <head> exists, so queue for DOMContentLoaded
      // But we CAN set classes on <html> immediately (it always exists)
      const theme = THEMES[saved];
      const html  = document.documentElement;
      if (theme.mode === 'dark') {
        html.classList.remove('isLightMode');
        html.classList.add('isDarkMode');
      } else {
        html.classList.remove('isDarkMode');
        html.classList.add('isLightMode');
      }
      html.classList.add(`tana-theme-${saved}`);
    }
  }
  earlyApply();

  // Once DOM is ready, inject styles and UI
  function onReady() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES[saved]) applyTheme(saved);

    // Tana loads asynchronously; wait a moment for its DOM to settle
    setTimeout(injectUI, 1800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  // Re-inject UI if Tana's SPA navigation removes our element
  const reinjector = new MutationObserver(() => {
    if (document.body && !document.getElementById('tt-root')) {
      setTimeout(injectUI, 600);
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (document.body) {
      reinjector.observe(document.body, { childList: true });
    }
  });

})();
