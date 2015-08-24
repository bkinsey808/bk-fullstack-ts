import {isBlank, isPresent, FunctionWrapper, BaseException} from "angular2/src/facade/lang";
import {List, Map, ListWrapper, StringMapWrapper} from "angular2/src/facade/collection";

export class AST {
  visit(visitor: AstVisitor): any { return null; }
  toString(): string { return "AST"; }
}

export class EmptyExpr extends AST {
  visit(visitor: AstVisitor) {
    // do nothing
  }
}

export class ImplicitReceiver extends AST {
  visit(visitor: AstVisitor): any { return visitor.visitImplicitReceiver(this); }
}

/**
 * Multiple expressions separated by a semicolon.
 */
export class Chain extends AST {
  constructor(public expressions: List<any>) { super(); }
  visit(visitor: AstVisitor): any { return visitor.visitChain(this); }
}

export class Conditional extends AST {
  constructor(public condition: AST, public trueExp: AST, public falseExp: AST) { super(); }
  visit(visitor: AstVisitor): any { return visitor.visitConditional(this); }
}

export class If extends AST {
  constructor(public condition: AST, public trueExp: AST, public falseExp?: AST) { super(); }
  visit(visitor: AstVisitor): any { return visitor.visitIf(this); }
}

export class PropertyRead extends AST {
  constructor(public receiver: AST, public name: string, public getter: Function) { super(); }
  visit(visitor: AstVisitor): any { return visitor.visitPropertyRead(this); }
}

export class PropertyWrite extends AST {
  constructor(public receiver: AST, public name: string, public setter: Function,
              public value: AST) {
    super();
  }
  visit(visitor: AstVisitor): any { return visitor.visitPropertyWrite(this); }
}

export class SafePropertyRead extends AST {
  constructor(public receiver: AST, public name: string, public getter: Function) { super(); }
  visit(visitor: AstVisitor): any { return visitor.visitSafePropertyRead(this); }
}

export class KeyedRead extends AST {
  constructor(public obj: AST, public key: AST) { super(); }
  visit(visitor: AstVisitor): any { return visitor.visitKeyedRead(this); }
}

export class KeyedWrite extends AST {
  constructor(public obj: AST, public key: AST, public value: AST) { super(); }
  visit(visitor: AstVisitor): any { return visitor.visitKeyedWrite(this); }
}

export class BindingPipe extends AST {
  constructor(public exp: AST, public name: string, public args: List<any>) { super(); }

  visit(visitor: AstVisitor): any { return visitor.visitPipe(this); }
}

export class LiteralPrimitive extends AST {
  constructor(public value) { super(); }
  visit(visitor: AstVisitor): any { return visitor.visitLiteralPrimitive(this); }
}

export class LiteralArray extends AST {
  constructor(public expressions: List<any>) { super(); }
  visit(visitor: AstVisitor): any { return visitor.visitLiteralArray(this); }
}

export class LiteralMap extends AST {
  constructor(public keys: List<any>, public values: List<any>) { super(); }
  visit(visitor: AstVisitor): any { return visitor.visitLiteralMap(this); }
}

export class Interpolation extends AST {
  constructor(public strings: List<any>, public expressions: List<any>) { super(); }
  visit(visitor: AstVisitor) { visitor.visitInterpolation(this); }
}

export class Binary extends AST {
  constructor(public operation: string, public left: AST, public right: AST) { super(); }
  visit(visitor: AstVisitor): any { return visitor.visitBinary(this); }
}

export class PrefixNot extends AST {
  constructor(public expression: AST) { super(); }
  visit(visitor: AstVisitor): any { return visitor.visitPrefixNot(this); }
}

export class MethodCall extends AST {
  constructor(public receiver: AST, public name: string, public fn: Function,
              public args: List<any>) {
    super();
  }
  visit(visitor: AstVisitor): any { return visitor.visitMethodCall(this); }
}

export class SafeMethodCall extends AST {
  constructor(public receiver: AST, public name: string, public fn: Function,
              public args: List<any>) {
    super();
  }
  visit(visitor: AstVisitor): any { return visitor.visitSafeMethodCall(this); }
}

export class FunctionCall extends AST {
  constructor(public target: AST, public args: List<any>) { super(); }
  visit(visitor: AstVisitor): any { return visitor.visitFunctionCall(this); }
}

export class ASTWithSource extends AST {
  constructor(public ast: AST, public source: string, public location: string) { super(); }
  visit(visitor: AstVisitor): any { return this.ast.visit(visitor); }
  toString(): string { return `${this.source} in ${this.location}`; }
}

export class TemplateBinding {
  constructor(public key: string, public keyIsVar: boolean, public name: string,
              public expression: ASTWithSource) {}
}

export interface AstVisitor {
  visitPropertyRead(ast: PropertyRead): any;
  visitPropertyWrite(ast: PropertyWrite): any;
  visitBinary(ast: Binary): any;
  visitChain(ast: Chain): any;
  visitConditional(ast: Conditional): any;
  visitIf(ast: If): any;
  visitPipe(ast: BindingPipe): any;
  visitFunctionCall(ast: FunctionCall): any;
  visitImplicitReceiver(ast: ImplicitReceiver): any;
  visitInterpolation(ast: Interpolation): any;
  visitKeyedRead(ast: KeyedRead): any;
  visitKeyedWrite(ast: KeyedWrite): any;
  visitLiteralArray(ast: LiteralArray): any;
  visitLiteralMap(ast: LiteralMap): any;
  visitLiteralPrimitive(ast: LiteralPrimitive): any;
  visitMethodCall(ast: MethodCall): any;
  visitPrefixNot(ast: PrefixNot): any;
  visitSafePropertyRead(ast: SafePropertyRead): any;
  visitSafeMethodCall(ast: SafeMethodCall): any;
}

export class AstTransformer implements AstVisitor {
  visitImplicitReceiver(ast: ImplicitReceiver): ImplicitReceiver { return ast; }

  visitInterpolation(ast: Interpolation): Interpolation {
    return new Interpolation(ast.strings, this.visitAll(ast.expressions));
  }

  visitLiteralPrimitive(ast: LiteralPrimitive): LiteralPrimitive {
    return new LiteralPrimitive(ast.value);
  }

  visitPropertyRead(ast: PropertyRead): PropertyRead {
    return new PropertyRead(ast.receiver.visit(this), ast.name, ast.getter);
  }

  visitPropertyWrite(ast: PropertyWrite): PropertyWrite {
    return new PropertyWrite(ast.receiver.visit(this), ast.name, ast.setter, ast.value);
  }

  visitSafePropertyRead(ast: SafePropertyRead): SafePropertyRead {
    return new SafePropertyRead(ast.receiver.visit(this), ast.name, ast.getter);
  }

  visitMethodCall(ast: MethodCall): MethodCall {
    return new MethodCall(ast.receiver.visit(this), ast.name, ast.fn, this.visitAll(ast.args));
  }

  visitSafeMethodCall(ast: SafeMethodCall): SafeMethodCall {
    return new SafeMethodCall(ast.receiver.visit(this), ast.name, ast.fn, this.visitAll(ast.args));
  }

  visitFunctionCall(ast: FunctionCall): FunctionCall {
    return new FunctionCall(ast.target.visit(this), this.visitAll(ast.args));
  }

  visitLiteralArray(ast: LiteralArray): LiteralArray {
    return new LiteralArray(this.visitAll(ast.expressions));
  }

  visitLiteralMap(ast: LiteralMap): LiteralMap {
    return new LiteralMap(ast.keys, this.visitAll(ast.values));
  }

  visitBinary(ast: Binary): Binary {
    return new Binary(ast.operation, ast.left.visit(this), ast.right.visit(this));
  }

  visitPrefixNot(ast: PrefixNot): PrefixNot { return new PrefixNot(ast.expression.visit(this)); }

  visitConditional(ast: Conditional): Conditional {
    return new Conditional(ast.condition.visit(this), ast.trueExp.visit(this),
                           ast.falseExp.visit(this));
  }

  visitPipe(ast: BindingPipe): BindingPipe {
    return new BindingPipe(ast.exp.visit(this), ast.name, this.visitAll(ast.args));
  }

  visitKeyedRead(ast: KeyedRead): KeyedRead {
    return new KeyedRead(ast.obj.visit(this), ast.key.visit(this));
  }

  visitKeyedWrite(ast: KeyedWrite): KeyedWrite {
    return new KeyedWrite(ast.obj.visit(this), ast.key.visit(this), ast.value.visit(this));
  }

  visitAll(asts: List<any>): List<any> {
    var res = ListWrapper.createFixedSize(asts.length);
    for (var i = 0; i < asts.length; ++i) {
      res[i] = asts[i].visit(this);
    }
    return res;
  }

  visitChain(ast: Chain): Chain { return new Chain(this.visitAll(ast.expressions)); }

  visitIf(ast: If): If {
    let falseExp = isPresent(ast.falseExp) ? ast.falseExp.visit(this) : null;
    return new If(ast.condition.visit(this), ast.trueExp.visit(this), falseExp);
  }
}