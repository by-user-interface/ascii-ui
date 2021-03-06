[ascii-ui API documentation](../README.md) > ["WidgetContainer"](../modules/_widgetcontainer_.md) > [BidirectionalIterator](../interfaces/_widgetcontainer_.bidirectionaliterator.md)

# Interface: BidirectionalIterator

Extended Iterator interface that will return a `next` and a `prev` methods.

## Type parameters
#### T 
## Hierarchy

 `Iterator`<`T`>

**↳ BidirectionalIterator**

## Index

### Methods

* [next](_widgetcontainer_.bidirectionaliterator.md#next)
* [prev](_widgetcontainer_.bidirectionaliterator.md#prev)
* [return](_widgetcontainer_.bidirectionaliterator.md#return)
* [seek](_widgetcontainer_.bidirectionaliterator.md#seek)
* [throw](_widgetcontainer_.bidirectionaliterator.md#throw)

---

## Methods

<a id="next"></a>

###  next

▸ **next**(value?: *`any`*): `IteratorResult`<`T`>

*Inherited from Iterator.next*

*Overrides Iterator.next*

*Defined in C:/dev/others/ascii-ui/node_modules/typedoc/node_modules/typescript/lib/lib.es6.d.ts:4798*

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` value | `any` |

**Returns:** `IteratorResult`<`T`>

___
<a id="prev"></a>

###  prev

▸ **prev**(): `IteratorResult`<`T`>

*Defined in [WidgetContainer.ts:8](https://github.com/danikaze/ascii-ui/blob/cfe4704/src/WidgetContainer.ts#L8)*

**Returns:** `IteratorResult`<`T`>

___
<a id="return"></a>

### `<Optional>` return

▸ **return**(value?: *`any`*): `IteratorResult`<`T`>

*Inherited from Iterator.return*

*Defined in C:/dev/others/ascii-ui/node_modules/typedoc/node_modules/typescript/lib/lib.es6.d.ts:4799*

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` value | `any` |

**Returns:** `IteratorResult`<`T`>

___
<a id="seek"></a>

###  seek

▸ **seek**(value?: * `T` &#124; `number`*): `void`

*Defined in [WidgetContainer.ts:9](https://github.com/danikaze/ascii-ui/blob/cfe4704/src/WidgetContainer.ts#L9)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` value |  `T` &#124; `number`|

**Returns:** `void`

___
<a id="throw"></a>

### `<Optional>` throw

▸ **throw**(e?: *`any`*): `IteratorResult`<`T`>

*Inherited from Iterator.throw*

*Defined in C:/dev/others/ascii-ui/node_modules/typedoc/node_modules/typescript/lib/lib.es6.d.ts:4800*

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` e | `any` |

**Returns:** `IteratorResult`<`T`>

___

