import { TSDocParser } from '../TSDocParser';
import { TextRange } from '../TextRange';
import {
  DocNode,
  DocNodeKind
} from '../../nodes';
import { ParserContext } from '../ParserContext';

interface ISnapshotItem {
  error?: string;
  failLine?: string;
  failSpan?: string;
  kind: string;
  nodes?: ISnapshotItem[];
  lineIndex?: number;
  nodeLine?: string;
  nodeSpan?: string;
}

export class TestHelpers {
  public static formatLineSpan(line: TextRange, range: TextRange): string {
    if (range.pos < line.pos || range.end > line.end) {
      throw new Error('Range must fall within the associated line');
    }

    const paddedSpace: string[]  = [ '',   ' ',  '  ',  '   ',  '    ' ];
    const paddedLArrow: string[] = [ '',   '>',  ' >',  '  >',  '   >' ];
    const paddedRArrow: string[] = [ '',   '<',  '< ',  '<  ',  '<   ' ];

    const buffer: string = line.buffer;

    let span: string = '';
    if (line.end > 0) {
      let i: number = line.pos - 1;
      while (i < range.pos - 1) {
        span += paddedSpace[TestHelpers.getEscaped(buffer[i]).length];
        ++i;
      }
      span += paddedLArrow[TestHelpers.getEscaped(buffer[i]).length];
      ++i;
      while (i < range.end) {
        span += paddedSpace[TestHelpers.getEscaped(buffer[i]).length];
        ++i;
      }
      if (i === line.end) {
        span += '<';
      } else {
        span += paddedRArrow[TestHelpers.getEscaped(buffer[i]).length];
        ++i;
        while (i < line.end) {
          span += paddedSpace[TestHelpers.getEscaped(buffer[i]).length];
          ++i;
        }
      }
    }
    return span;
  }

  // Workaround various characters that get ugly escapes in Jest snapshots
  public static getEscaped(s: string): string {
    return s.replace(/\n/g, '[n]')
      .replace(/\r/g, '[r]')
      .replace(/\t/g, '[t]')
      .replace(/\f/g, '[f]')
      .replace(/\\/g, '[b]')
      .replace(/\"/g, '[q]')
      .replace(/`/g, '[c]')
      .replace(/\</g, '[<]')
      .replace(/\>/g, '[>]');
  }

  public static parseAndMatchSnapshot(buffer: string): void {
    const tsdocParser: TSDocParser = new TSDocParser();
    const parserContext: ParserContext = tsdocParser.parseString(buffer);

    expect({
      buffer: TestHelpers.getEscaped(buffer),
      lines: parserContext.lines.map(x => TestHelpers.getEscaped(x.toString())),
      rootNode: TestHelpers._getNodeSnapshot(parserContext.docComment, parserContext.lines)
    }).toMatchSnapshot();
  }

  private static _getNodeSnapshot(docNode: DocNode, lines: TextRange[]): ISnapshotItem {
    const item: ISnapshotItem = {
      kind: DocNodeKind[docNode.kind]
    };
    /*

    if (docNode.getChildNodes().length === 0) {
      item.nodes = docNode.getChildNodes().map(x => TestHelpers._getNodeSnapshot(x, lines));
    } else {
      item.lineIndex = lines.indexOf(docNode.excerpt);
      item.nodeLine = '>' + TestHelpers.getEscaped(docNode.docCommentLine.toString()) + '<';
      item.nodeSpan = TestHelpers.formatLineSpan(docNode.docCommentLine, docNode.range);

      if (docNode instanceof DocErrorText) {
        item.error = docNode.errorMessage;
        item.failLine = '>' + TestHelpers.getEscaped(docNode.errorDocCommentLine.toString()) + '<';
        item.failSpan = TestHelpers.formatLineSpan(docNode.errorDocCommentLine, docNode.errorLocation);
      }
    }
    */
    return item;
  }
}
