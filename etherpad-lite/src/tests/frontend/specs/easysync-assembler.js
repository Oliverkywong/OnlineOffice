'use strict';

const Changeset = require('../../../static/js/Changeset');
const {padutils} = require('../../../static/js/pad_utils');
const {poolOrArray} = require('../easysync-helper.js');

describe('easysync-assembler', function () {
  it('opAssembler', async function () {
    const x = '-c*3*4+6|3=az*asdf0*1*2*3+1=1-1+1*0+1=1-1+1|c=c-1';
    const assem = Changeset.opAssembler();
    for (const op of Changeset.deserializeOps(x)) assem.append(op);
    expect(assem.toString()).to.equal(x);
  });

  it('smartOpAssembler', async function () {
    const x = '-c*3*4+6|3=az*asdf0*1*2*3+1=1-1+1*0+1=1-1+1|c=c-1';
    const assem = Changeset.smartOpAssembler();
    for (const op of Changeset.deserializeOps(x)) assem.append(op);
    assem.endDocument();
    expect(assem.toString()).to.equal(x);
  });

  it('smartOpAssembler ignore additional pure keeps (no attributes)', async function () {
    const x = '-c*3*4+6|1+1=5';
    const assem = Changeset.smartOpAssembler();
    for (const op of Changeset.deserializeOps(x)) assem.append(op);
    assem.endDocument();
    expect(assem.toString()).to.equal('-c*3*4+6|1+1');
  });

  it('smartOpAssembler merge consecutive + ops without multiline', async function () {
    const x = '-c*3*4+6*3*4+1*3*4+9=5';
    const assem = Changeset.smartOpAssembler();
    for (const op of Changeset.deserializeOps(x)) assem.append(op);
    assem.endDocument();
    expect(assem.toString()).to.equal('-c*3*4+g');
  });

  it('smartOpAssembler merge consecutive + ops with multiline', async function () {
    const x = '-c*3*4+6*3*4|1+1*3*4|9+f*3*4+k=5';
    const assem = Changeset.smartOpAssembler();
    for (const op of Changeset.deserializeOps(x)) assem.append(op);
    assem.endDocument();
    expect(assem.toString()).to.equal('-c*3*4|a+m*3*4+k');
  });

  it('smartOpAssembler merge consecutive - ops without multiline', async function () {
    const x = '-c-6-1-9=5';
    const assem = Changeset.smartOpAssembler();
    for (const op of Changeset.deserializeOps(x)) assem.append(op);
    assem.endDocument();
    expect(assem.toString()).to.equal('-s');
  });

  it('smartOpAssembler merge consecutive - ops with multiline', async function () {
    const x = '-c-6|1-1|9-f-k=5';
    const assem = Changeset.smartOpAssembler();
    for (const op of Changeset.deserializeOps(x)) assem.append(op);
    assem.endDocument();
    expect(assem.toString()).to.equal('|a-y-k');
  });

  it('smartOpAssembler merge consecutive = ops without multiline', async function () {
    const x = '-c*3*4=6*2*4=1*3*4=f*3*4=2*3*4=a=k=5';
    const assem = Changeset.smartOpAssembler();
    for (const op of Changeset.deserializeOps(x)) assem.append(op);
    assem.endDocument();
    expect(assem.toString()).to.equal('-c*3*4=6*2*4=1*3*4=r');
  });

  it('smartOpAssembler merge consecutive = ops with multiline', async function () {
    const x = '-c*3*4=6*2*4|1=1*3*4|9=f*3*4|2=2*3*4=a*3*4=1=k=5';
    const assem = Changeset.smartOpAssembler();
    for (const op of Changeset.deserializeOps(x)) assem.append(op);
    assem.endDocument();
    expect(assem.toString()).to.equal('-c*3*4=6*2*4|1=1*3*4|b=h*3*4=b');
  });

  it('smartOpAssembler ignore + ops with ops.chars === 0', async function () {
    const x = '-c*3*4+6*3*4+0*3*4+1+0*3*4+1';
    const assem = Changeset.smartOpAssembler();
    for (const op of Changeset.deserializeOps(x)) assem.append(op);
    assem.endDocument();
    expect(assem.toString()).to.equal('-c*3*4+8');
  });

  it('smartOpAssembler ignore - ops with ops.chars === 0', async function () {
    const x = '-c-6-0-1-0-1';
    const assem = Changeset.smartOpAssembler();
    for (const op of Changeset.deserializeOps(x)) assem.append(op);
    assem.endDocument();
    expect(assem.toString()).to.equal('-k');
  });

  it('smartOpAssembler append + op with text', async function () {
    const assem = Changeset.smartOpAssembler();
    const pool = poolOrArray([
      'attr1,1',
      'attr2,2',
      'attr3,3',
      'attr4,4',
      'attr5,5',
    ]);

    padutils.warnDeprecated.disabledForTestingOnly = true;
    try {
      assem.appendOpWithText('+', 'test', '*3*4*5', pool);
      assem.appendOpWithText('+', 'test', '*3*4*5', pool);
      assem.appendOpWithText('+', 'test', '*1*4*5', pool);
    } finally {
      delete padutils.warnDeprecated.disabledForTestingOnly;
    }
    assem.endDocument();
    expect(assem.toString()).to.equal('*3*4*5+8*1*4*5+4');
  });

  it('smartOpAssembler append + op with multiline text', async function () {
    const assem = Changeset.smartOpAssembler();
    const pool = poolOrArray([
      'attr1,1',
      'attr2,2',
      'attr3,3',
      'attr4,4',
      'attr5,5',
    ]);

    padutils.warnDeprecated.disabledForTestingOnly = true;
    try {
      assem.appendOpWithText('+', 'test\ntest', '*3*4*5', pool);
      assem.appendOpWithText('+', '\ntest\n', '*3*4*5', pool);
      assem.appendOpWithText('+', '\ntest', '*1*4*5', pool);
    } finally {
      delete padutils.warnDeprecated.disabledForTestingOnly;
    }
    assem.endDocument();
    expect(assem.toString()).to.equal('*3*4*5|3+f*1*4*5|1+1*1*4*5+4');
  });

  it('smartOpAssembler clear should empty internal assemblers', async function () {
    const x = '-c*3*4+6|3=az*asdf0*1*2*3+1=1-1+1*0+1=1-1+1|c=c-1';
    const ops = Changeset.deserializeOps(x);
    const iter = {
      _n: ops.next(),
      hasNext() { return !this._n.done; },
      next() { const v = this._n.value; this._n = ops.next(); return v; },
    };
    const assem = Changeset.smartOpAssembler();
    assem.append(iter.next());
    assem.append(iter.next());
    assem.append(iter.next());
    assem.clear();
    assem.append(iter.next());
    assem.append(iter.next());
    assem.clear();
    while (iter.hasNext()) assem.append(iter.next());
    assem.endDocument();
    expect(assem.toString()).to.equal('-1+1*0+1=1-1+1|c=c-1');
  });

  describe('append atext to assembler', function () {
    const testAppendATextToAssembler = (testId, atext, correctOps) => {
      it(`testAppendATextToAssembler#${testId}`, async function () {
        const assem = Changeset.smartOpAssembler();
        for (const op of Changeset.opsFromAText(atext)) assem.append(op);
        expect(assem.toString()).to.equal(correctOps);
      });
    };

    testAppendATextToAssembler(1, {
      text: '\n',
      attribs: '|1+1',
    }, '');
    testAppendATextToAssembler(2, {
      text: '\n\n',
      attribs: '|2+2',
    }, '|1+1');
    testAppendATextToAssembler(3, {
      text: '\n\n',
      attribs: '*x|2+2',
    }, '*x|1+1');
    testAppendATextToAssembler(4, {
      text: '\n\n',
      attribs: '*x|1+1|1+1',
    }, '*x|1+1');
    testAppendATextToAssembler(5, {
      text: 'foo\n',
      attribs: '|1+4',
    }, '+3');
    testAppendATextToAssembler(6, {
      text: '\nfoo\n',
      attribs: '|2+5',
    }, '|1+1+3');
    testAppendATextToAssembler(7, {
      text: '\nfoo\n',
      attribs: '*x|2+5',
    }, '*x|1+1*x+3');
    testAppendATextToAssembler(8, {
      text: '\n\n\nfoo\n',
      attribs: '|2+2*x|2+5',
    }, '|2+2*x|1+1*x+3');
  });
});
