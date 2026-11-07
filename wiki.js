/* Bloomfire Wiki — shared script. Every page loads this file (structure_wiki.py check asserts it).
   It does four small jobs, with no build step and no dependencies, from file:// or any static host:

   1. "ON THIS PAGE". It lists the page's own <h2> headings beneath the current page's link in the
   left rail on a wide screen, and in a collapsed box under the header on a narrow one. It is built
   at load because a hand-kept contents list is a second copy of the headings.

   2. PREVIOUS / NEXT, read off the nav's link order (the nav is owned by structure_wiki.py).

   3. A link that lands inside a folded "Why" block opens the block.

   4. DIAGRAMS. On a page that loads mermaid.min.js, every <pre class="mermaid"> is rendered with a
   theme drawn from wiki.css's game palette, so edges and labels stay readable on the dark page.

   With scripts off a page loses its contents list, previous/next links and rendered diagrams (the
   diagram source stays readable as text), and nothing else. */
(function () {
  'use strict';

  function sectionLinks() {
    var out = [];
    var heads = document.querySelectorAll('main h2');
    for (var i = 0; i < heads.length; i++) {
      var h = heads[i];
      // A section's id lives on the <h2> itself or on the <section> wrapping it.
      var id = h.id || (h.closest('section[id]') || {}).id;
      if (!id) continue;
      var num = h.querySelector('.num');
      var label = h.textContent.replace(num ? num.textContent : '', '').trim();
      out.push({ id: id, num: num ? num.textContent.trim() : '', label: label });
    }
    return out;
  }

  function buildList(items, tag) {
    var list = document.createElement(tag);
    items.forEach(function (it) {
      var a = document.createElement('a');
      a.href = '#' + it.id;
      if (it.num) {
        var n = document.createElement('span');
        n.className = 'n';
        n.textContent = it.num;
        a.appendChild(n);
      }
      a.appendChild(document.createTextNode(it.label));
      if (tag === 'ol') {
        var li = document.createElement('li');
        li.appendChild(a);
        list.appendChild(li);
      } else {
        list.appendChild(a);
      }
    });
    return list;
  }

  // Runs before the contents list is inserted, and reads only the group's DIRECT links, because
  // the rail's contents list is itself a run of <a>s inside the current page's group.
  function prevNext() {
    var main = document.querySelector('main');
    if (!main || main.querySelector('.pn')) return;
    var links = document.querySelectorAll('nav.wiki .grp > a');
    var at = -1;
    for (var i = 0; i < links.length; i++) {
      if (links[i].classList.contains('on')) { at = i; break; }
    }
    if (at < 0) return;   // the home page is not in the chain

    function link(href, cue, label) {
      var a = document.createElement('a');
      a.href = href;
      var s = document.createElement('span');
      s.textContent = cue;
      a.appendChild(s);
      a.appendChild(document.createTextNode(label));
      return a;
    }
    var box = document.createElement('div');
    box.className = 'pn';
    box.appendChild(at > 0
      ? link(links[at - 1].getAttribute('href'), '← Previous', links[at - 1].textContent)
      : link('index.html', '← Home', 'Wiki index'));
    box.appendChild(at < links.length - 1
      ? link(links[at + 1].getAttribute('href'), 'Next →', links[at + 1].textContent)
      : link('index.html', 'Home', 'Wiki index →'));
    main.appendChild(box);
  }

  function init() {
    prevNext();

    var items = sectionLinks();
    if (items.length >= 3) {   // a page shorter than that does not need a contents list
      // wide screens: under the current page's link in the rail
      var current = document.querySelector('nav.wiki a.on:not(.home)');
      if (current) {
        var rail = buildList(items, 'div');
        rail.className = 'toc';
        current.insertAdjacentElement('afterend', rail);
        if (current.scrollIntoView) current.scrollIntoView({ block: 'center' });
      }

      // narrow screens: a collapsed box at the top of the content
      var main = document.querySelector('main');
      if (main) {
        var box = document.createElement('details');
        box.className = 'toc toc-inline';
        var sum = document.createElement('summary');
        sum.textContent = 'On this page';
        box.appendChild(sum);
        box.appendChild(buildList(items, 'ol'));
        main.insertBefore(box, main.firstChild);
      }
    }

    // A link into a folded "Why this rule exists" block should open it.
    function openTarget() {
      if (!location.hash) return;
      var t;
      try { t = document.querySelector(location.hash); } catch (e) { return; }
      var d = t && t.closest ? t.closest('details') : null;
      while (d) { d.open = true; d = d.parentElement ? d.parentElement.closest('details') : null; }
      if (t && t.scrollIntoView) t.scrollIntoView();
    }
    window.addEventListener('hashchange', openTarget);
    openTarget();
  }

  function diagrams() {
    if (!window.mermaid || !document.querySelector('pre.mermaid')) return;
    window.mermaid.initialize({
      startOnLoad: false, securityLevel: 'strict', theme: 'base',
      // The binder's colours (wiki.css says where each comes from): boxes are card tiles on the inset
      // well with bronze edges, arrows are --sage, cluster frames take --edge, and notes are --note.
      // A page's classDef lines recolour the edges of the boxes they name.
      themeVariables: {
        darkMode: true, background: '#061214', fontFamily: '"Liberation Sans", Arimo, Arial, Helvetica, sans-serif', fontSize: '14px',
        primaryColor: '#11242e', primaryTextColor: '#f5eedc', primaryBorderColor: '#ddb777',
        secondaryColor: '#1c3840', secondaryTextColor: '#f5eedc', secondaryBorderColor: '#94d9b2',
        tertiaryColor: '#0d1c26', tertiaryTextColor: '#f5eedc', tertiaryBorderColor: '#58c4b2',
        lineColor: '#7e928a', textColor: '#f5eedc', mainBkg: '#11242e', nodeBorder: '#ddb777',
        clusterBkg: '#0a171c', clusterBorder: '#547070', titleColor: '#ddb777', edgeLabelBackground: '#0d1c26',
        actorBkg: '#11242e', actorBorder: '#ddb777', actorTextColor: '#f5eedc', actorLineColor: '#7e928a',
        signalColor: '#f5eedc', signalTextColor: '#f5eedc', labelBoxBkgColor: '#11242e', labelBoxBorderColor: '#94d9b2',
        labelTextColor: '#f5eedc', loopTextColor: '#f5eedc', noteBkgColor: '#132921', noteTextColor: '#f5eedc', noteBorderColor: '#94d9b2',
        activationBkgColor: '#1c4953', activationBorderColor: '#58c4b2', sequenceNumberColor: '#0a171c',
        classText: '#f5eedc', labelColor: '#f5eedc', stateLabelColor: '#f5eedc', altBackground: '#0a171c'
      },
      flowchart: { htmlLabels: true, curve: 'basis' },
      class: { htmlLabels: true }
    });
    var run = window.mermaid.run({ querySelector: 'pre.mermaid' });
    if (run && run.then) run.then(naturalSize);
  }

  // Mermaid draws every diagram at 100% of its frame, which blows a narrow flowchart up to several
  // screens tall and squeezes a wide class diagram until its text is unreadable. Show each one at
  // its own drawn size instead: a narrow diagram stays compact and centred, a wide one scrolls
  // sideways inside its .diagram frame.
  function naturalSize() {
    var svgs = document.querySelectorAll('pre.mermaid svg');
    for (var i = 0; i < svgs.length; i++) {
      var box = (svgs[i].getAttribute('viewBox') || '').split(/[\s,]+/);
      var width = parseFloat(box[2]);
      if (!(width > 0)) continue;
      svgs[i].removeAttribute('width');
      svgs[i].style.width = Math.ceil(width) + 'px';
      svgs[i].style.maxWidth = 'none';
      svgs[i].style.display = 'block';
      svgs[i].style.margin = '0 auto';
    }
  }

  function start() { init(); diagrams(); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
