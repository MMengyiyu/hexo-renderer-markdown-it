'use strict';

require('chai').should();
const fs = require('fs');
const render = require('../lib/renderer');
const source = fs.readFileSync('./test/fixtures/markdownit.md', 'utf8');
const Hexo = require('hexo');

describe('Hexo Renderer Markdown-it', () => {
  const hexo = new Hexo(__dirname, { silent: true });
  const parse = render.bind(hexo);
  const defaultCfg = JSON.parse(JSON.stringify(hexo.config));

  beforeEach(() => {
    hexo.config = JSON.parse(JSON.stringify(defaultCfg));
  });

  it('should render GFM if no config provided', () => {
    hexo.config = {};

    const parsed_without_config = fs.readFileSync('./test/fixtures/outputs/default.html', 'utf8');
    const result = parse({
      text: source
    });
    result.should.equal(parsed_without_config);
  });

  it('should render CommonMark if config is \'commonmark\'', () => {
    hexo.config.markdown = 'commonmark';

    const parsed_commonmark = fs.readFileSync('./test/fixtures/outputs/commonmark.html', 'utf8');
    const result = parse({
      text: source
    });
    result.should.equal(parsed_commonmark);
  });

  it('should render a limited subset of Markdown if using \'zero\'', () => {
    hexo.config.markdown = 'zero';

    const parsed_zero = fs.readFileSync('./test/fixtures/outputs/zero.html', 'utf8');
    const result = parse({
      text: source
    });
    result.should.equal(parsed_zero);
  });

  it('should render something very close to GFM with \'default\'', () => {
    hexo.config.markdown = 'default';

    const parsed_gfm = fs.readFileSync('./test/fixtures/outputs/default.html', 'utf8');
    const result = parse({
      text: source
    });
    result.should.equal(parsed_gfm);
  });

  it('should handle a custom configuration', () => {
    hexo.config.markdown = {
      render: {
        html: false,
        xhtmlOut: true,
        breaks: true,
        langPrefix: '',
        linkify: true,
        typographer: true,
        quotes: '«»“”'
      }
    };

    const parsed_custom = fs.readFileSync('./test/fixtures/outputs/custom.html', 'utf8');
    const source = fs.readFileSync('./test/fixtures/markdownit.md', 'utf8');
    const result = parse({
      text: source
    });
    result.should.equal(parsed_custom);
  });

  it('should render plugins if they are defined', () => {
    hexo.config.markdown = {
      render: {
        html: false,
        xhtmlOut: false,
        breaks: false,
        langPrefix: 'language-',
        linkify: false,
        typographer: false,
        quotes: '«»“”'
      },
      plugins: [
        'markdown-it-abbr',
        'markdown-it-container',
        'markdown-it-deflist',
        'markdown-it-emoji',
        'markdown-it-footnote',
        'markdown-it-ins',
        'markdown-it-mark',
        'markdown-it-sub',
        'markdown-it-sup'
      ]
    };

    const parsed_plugins = fs.readFileSync('./test/fixtures/outputs/plugins.html', 'utf8');
    const source = fs.readFileSync('./test/fixtures/markdownit.md', 'utf8');
    const result = parse({
      text: source
    });
    result.should.equal(parsed_plugins);
  });

  it('should render a plugin defined as an object', () => {
    hexo.config.markdown = {
      render: {
        html: false,
        xhtmlOut: false,
        breaks: false,
        langPrefix: 'language-',
        linkify: false,
        typographer: false,
        quotes: '«»“”'
      },
      plugins: [
        'markdown-it-abbr',
        'markdown-it-container',
        'markdown-it-deflist',
        'markdown-it-emoji',
        'markdown-it-footnote',
        'markdown-it-ins',
        'markdown-it-mark',
        'markdown-it-sub',
        'markdown-it-sup'
      ]
    };

    const parsed_plugins = fs.readFileSync('./test/fixtures/outputs/plugins.html', 'utf8');
    const source = fs.readFileSync('./test/fixtures/markdownit.md', 'utf8');
    const result = parse({
      text: source
    });
    result.should.equal(parsed_plugins);
  });

  it('anchors - should render anchor-headers if they are defined', () => {
    hexo.config.markdown = {
      anchors: {
        level: 2,
        collisionSuffix: 'ver',
        permalink: true,
        permalinkClass: 'header-anchor',
        permalinkSymbol: '¶'
      }
    };
    const anchors_with_permalinks = fs.readFileSync('./test/fixtures/outputs/anchors.html', 'utf8');
    const result = parse({
      text: source
    });

    hexo.config.markdown = {
      anchors: {
        level: 1,
        collisionSuffix: '',
        permalink: false,
        permalinkClass: 'header-anchor',
        permalinkSymbol: '¶'
      }
    };
    const anchorsNoPerm = '<h1 id="This-is-an-H1-title">This is an H1 title</h1>\n<h1 id="This-is-an-H1-title-2">This is an H1 title</h1>\n';
    const anchorsNoPerm_parse = render.bind(hexo);
    const anchorsNoPerm_result = anchorsNoPerm_parse({
      text: '# This is an H1 title\n# This is an H1 title'
    });

    anchorsNoPerm_result.should.equal(anchorsNoPerm);
    result.should.equal(anchors_with_permalinks);
  });

  it('anchors - should parse options correctly', () => {
    hexo.config.markdown = {
      anchors: {
        level: 2,
        case: 1,
        separator: '_'
      }
    };

    const result = parse({
      text: '## foo BAR'
    });
    result.should.equal('<h2 id="foo_bar">foo BAR</h2>\n');
  });

  describe('execFilter', () => {
    it('default', () => {
      const result = parse({
        text: '[foo](javascript:bar)'
      });
      result.should.equal('<p>[foo](javascript:bar)</p>\n');
    });

    it('enable unsafe link', () => {
      hexo.extend.filter.register('markdown-it:renderer', md => {
        md.validateLink = function() { return true; };
      });

      const result = parse({
        text: '[foo](javascript:bar)'
      });
      result.should.equal('<p><a href="javascript:bar">foo</a></p>\n');

    });
  });


  describe('anchors - permalinkSide', () => {
    const text = '## foo';

    it('left', () => {
      hexo.config.markdown = {
        anchors: {
          level: 2,
          permalink: true,
          permalinkClass: 'anchor',
          permalinkSide: 'left',
          permalinkSymbol: '#'
        }
      };
      const result = parse({ text });

      result.should.equal('<h2 id="foo"><a class="anchor" href="#foo">#</a>foo</h2>\n');
    });

    it('right', () => {
      hexo.config.markdown = {
        anchors: {
          level: 2,
          permalink: true,
          permalinkClass: 'anchor',
          permalinkSide: 'right',
          permalinkSymbol: '#'
        }
      };
      const result = parse({ text });

      result.should.equal('<h2 id="foo">foo<a class="anchor" href="#foo">#</a></h2>\n');
    });
  });
});
