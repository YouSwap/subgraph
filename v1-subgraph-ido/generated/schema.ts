// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Ido extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Ido entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Ido entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Ido", id.toString(), this);
  }

  static load(id: string): Ido | null {
    return store.get("Ido", id) as Ido | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get user(): string {
    let value = this.get("user");
    return value.toString();
  }

  set user(value: string) {
    this.set("user", Value.fromString(value));
  }

  get type(): string {
    let value = this.get("type");
    return value.toString();
  }

  set type(value: string) {
    this.set("type", Value.fromString(value));
  }

  get address(): string {
    let value = this.get("address");
    return value.toString();
  }

  set address(value: string) {
    this.set("address", Value.fromString(value));
  }

  get usdtpayed(): BigDecimal {
    let value = this.get("usdtpayed");
    return value.toBigDecimal();
  }

  set usdtpayed(value: BigDecimal) {
    this.set("usdtpayed", Value.fromBigDecimal(value));
  }

  get usdtused(): BigDecimal {
    let value = this.get("usdtused");
    return value.toBigDecimal();
  }

  set usdtused(value: BigDecimal) {
    this.set("usdtused", Value.fromBigDecimal(value));
  }

  get yougoted(): BigDecimal {
    let value = this.get("yougoted");
    return value.toBigDecimal();
  }

  set yougoted(value: BigDecimal) {
    this.set("yougoted", Value.fromBigDecimal(value));
  }

  get transaciton(): string {
    let value = this.get("transaciton");
    return value.toString();
  }

  set transaciton(value: string) {
    this.set("transaciton", Value.fromString(value));
  }

  get blockheight(): BigInt {
    let value = this.get("blockheight");
    return value.toBigInt();
  }

  set blockheight(value: BigInt) {
    this.set("blockheight", Value.fromBigInt(value));
  }

  get timestmp(): BigInt {
    let value = this.get("timestmp");
    return value.toBigInt();
  }

  set timestmp(value: BigInt) {
    this.set("timestmp", Value.fromBigInt(value));
  }

  get state(): string {
    let value = this.get("state");
    return value.toString();
  }

  set state(value: string) {
    this.set("state", Value.fromString(value));
  }
}

export class IdoUser extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save IdoUser entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save IdoUser entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("IdoUser", id.toString(), this);
  }

  static load(id: string): IdoUser | null {
    return store.get("IdoUser", id) as IdoUser | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get address(): string {
    let value = this.get("address");
    return value.toString();
  }

  set address(value: string) {
    this.set("address", Value.fromString(value));
  }

  get pubcanclaim(): boolean {
    let value = this.get("pubcanclaim");
    return value.toBoolean();
  }

  set pubcanclaim(value: boolean) {
    this.set("pubcanclaim", Value.fromBoolean(value));
  }

  get pricanclaim(): boolean {
    let value = this.get("pricanclaim");
    return value.toBoolean();
  }

  set pricanclaim(value: boolean) {
    this.set("pricanclaim", Value.fromBoolean(value));
  }

  get pubtotalusdtpayed(): BigDecimal {
    let value = this.get("pubtotalusdtpayed");
    return value.toBigDecimal();
  }

  set pubtotalusdtpayed(value: BigDecimal) {
    this.set("pubtotalusdtpayed", Value.fromBigDecimal(value));
  }

  get idoslist(): Array<string> | null {
    let value = this.get("idoslist");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set idoslist(value: Array<string> | null) {
    if (value === null) {
      this.unset("idoslist");
    } else {
      this.set("idoslist", Value.fromStringArray(value as Array<string>));
    }
  }

  get idos(): Array<string> | null {
    let value = this.get("idos");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set idos(value: Array<string> | null) {
    if (value === null) {
      this.unset("idos");
    } else {
      this.set("idos", Value.fromStringArray(value as Array<string>));
    }
  }
}
