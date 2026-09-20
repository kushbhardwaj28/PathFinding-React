import React from 'react';

const KEYWORDS = new Set([
    'function', 'class', 'const', 'let', 'return', 'while', 'for', 'if', 'else',
    'continue', 'break', 'new', 'of', 'in', 'true', 'false', 'null', 'Infinity',
    'throw', 'get', 'set',
]);

type Token = { text: string; className: string };

const TOKEN_PATTERN = /(?<space>\s+)|(?<word>[A-Za-z_$#][\w$]*)|(?<number>\d+)|(?<punct>[^\sA-Za-z_$#\d]+)/g;

function tokenize(line: string): Token[] {
    if (line.trim().startsWith('//')) return [{ text: line, className: 'av-t-com' }];
    const out: Token[] = [];
    const pattern = new RegExp(TOKEN_PATTERN);
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(line))) {
        let className = 'av-t-base';
        if (match.groups!.word) className = KEYWORDS.has(match[0]) ? 'av-t-kw' : line[pattern.lastIndex] === '(' ? 'av-t-fn' : 'av-t-base';
        else if (match.groups!.number) className = 'av-t-num';
        else if (match.groups!.punct) className = 'av-t-punc';
        out.push({ text: match[0], className });
    }
    return out.length ? out : [{ text: ' ', className: 'av-t-base' }];
}

interface CodeBlockProps {
    code: string[];
    file?: string;
    maxHeight?: number;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, file, maxHeight }) => (
    <div className="av-code">
        {file && (
            <div className="av-code-head">
                <span className="av-mono av-dim">{file}</span>
                <span className="av-kicker">Reference</span>
            </div>
        )}
        <div className="av-code-body" style={maxHeight ? { maxHeight, overflow: 'auto' } : undefined}>
            {code.map((line, i) => (
                <div className="av-code-line" key={i}>
                    <span className="av-code-n">{i + 1}</span>
                    <span className="av-code-src">
                        {tokenize(line).map((tok, j) => (
                            <span className={tok.className} key={j}>
                                {tok.text}
                            </span>
                        ))}
                    </span>
                </div>
            ))}
        </div>
    </div>
);
