import { Terminal, TerminalEvent, TerminalSize } from '../Terminal';
import { Widget, WidgetOptions } from '../Widget';
import { WidgetContainer } from '../WidgetContainer';

export interface GridOptions extends WidgetOptions {
  /** Number of rows of the grid */
  rows: number;
  /** Number of columns of the grid */
  columns: number;
  /** Expand (or not) to the full size of the terminal */
  fullSize?: boolean;
  /**
   * Function used to calculate the starts of the rows/columns
   * Leave `undefined` to use the default one
   *
   * It needs to return an array of the tiles where each row/column starts
   */
  calculateStarts?(available: number, cells: number, isRow: boolean, terminal: Terminal): number[];
}

interface AttachedWidget {
  /** interal id used for deattachWidget */
  id: number;
  /** widget instance */
  widget: Widget;
  /** x-position in grid columns */
  col: number;
  /** y-position in grid rows */
  line: number;
  /** width in grid columns */
  width: number;
  /** height in grid rows */
  height: number;
}

/**
 * Provides a dynamic grid system for Terminal Widgets
 */
export class Grid extends Widget implements WidgetContainer {
  /** Incremental widget ids counter */
  private static widgetIds: number = 0;

  /** Grid options */
  protected options: GridOptions;

  /** List of attached widgets */
  private readonly attachedWidgets: AttachedWidget[] = [];
  /** list of the first tile of each column */
  private columnStarts: number[] = [];
  /** list of the first tile of each row */
  private rowStarts: number[] = [];

  constructor(terminal: Terminal, options: GridOptions) {
    super(terminal, options);
    this.options = { ...this.options, ...options };
    if (!this.options.calculateStarts) {
      this.options.calculateStarts = calculateStarts;
    }
    if (typeof options.fullSize === 'undefined') {
      this.options.fullSize = true;
    }

    const terminalSize = terminal.getSize();
    if (this.options.fullSize) {
      this.setOptions({
        col: 0,
        line: 0,
        width: terminalSize.columns,
        height: terminalSize.rows,
      });
      terminal.listen(TerminalEvent.RESIZED, this.resizedEventHandler.bind(this));
    } else {
      this.setOptions({
        col: options.col || 0,
        line: options.line || 0,
        width: options.width || terminalSize.columns,
        height: options.height || terminalSize.rows,
      });
    }

    this.recalculateCellSizes();
  }

  /**
   * Render all the attached widgets to the grid
   */
  render(): void {
    this.attachedWidgets.forEach((instance) => {
      instance.widget.render();
    });
  }

  /**
   * Here's where the calculation of the real size of the attached widget is done
   * Widget won't be placed properly until this method is not called (to avoid duplicated calculations)
   */
  align(attachedWidget?: AttachedWidget): void {
    const columnStarts = this.columnStarts;
    const rowStarts = this.rowStarts;

    /** Update the options of a widget after being aligned */
    function alignOne(w: AttachedWidget) {
      const col = columnStarts[w.col];
      const line = rowStarts[w.line];
      const width = columnStarts[w.col + w.width] - col;
      const height = rowStarts[w.line + w.height] - line;

      w.widget.setOptions({ col, line, width, height });
      w.widget.render();
    }

    if (attachedWidget) {
      alignOne(attachedWidget);
    } else {
      this.attachedWidgets.forEach(alignOne);
    }
  }

  /**
   * Attach a widget to the grid
   *
   * @param col column of the grid
   * @param line row of the grid
   * @param width how many grid columns the widget should occupy
   * @param height how many grid rows the widget should occupy
   * @param WidgetClass Class of the widget to attach
   * @param options Options to pass to the Widget when creating it
   * @return widget instance
   */
  attachWidget(col: number, line: number, width: number, height: number, WidgetClass: typeof Widget, ...args): Widget {
    const widget: Widget = Reflect.construct(WidgetClass, [this.terminal, ...args]);
    const attachedWidget: AttachedWidget = {
      id: ++Grid.widgetIds,
      widget,
      col,
      line,
      width,
      height,
    };

    this.attachedWidgets.push(attachedWidget);
    this.align(attachedWidget);

    return widget;
  }

  /**
   * Dettach a widget from this terminal
   *
   * @param handler Value returned by `attachWidget`
   * @return `true` if the widget was found (and removed). `false` if not found
   */
  dettachWidget(widget: Widget): boolean {
    const index = this.attachedWidgets.findIndex((instance) => instance.widget === widget);

    if (index !== -1) {
      this.attachedWidgets.splice(index, 1);
      const position = widget.getPosition();
      const size = widget.getSize();
      this.terminal.clear(position.col, position.line, size.columns, size.rows);
    }

    return index !== -1;
  }

  /**
   * Get a previously attached widget by its position in the terminal
   *
   * @param column column of the terminal
   * @param line line of the terminal
   * @return widget or `undefined` if not found
   */
  getWidgetAt(column: number, line: number): Widget {
    for (const instance of this.attachedWidgets) {
      if (instance.widget.isAt(column, line)) {
        return instance.widget;
      }
    }

    return undefined;
  }
  /**
   * Get a previously attached widget by its position in the Grid
   *
   * @param column column of the grid
   * @param line line of the grid
   * @return widget or `undefined` if not found
   */
  getWidgetGrid(column: number, line: number): Widget {
    const attachedWidget = this.attachedWidgets.filter((instance) => instance.col >= column
      && instance.col < column + instance.width
      && instance.line >= line
      && instance.line < line + instance.height)[0];

    return attachedWidget ? attachedWidget.widget : undefined;
  }

  /**
   * Get the size of a cell of the grid in tiles
   *
   * @param column column of the grid
   * @param line line of the grid
   * @return size of a cell
   */
  getCellSize(column: number, line: number): TerminalSize {
    return {
      columns: this.columnStarts[column + 1] - this.columnStarts[column],
      rows: this.rowStarts[line + 1] - this.rowStarts[line],
    };
  }

  /**
   * `setOptions` will assign the options to `this.options`,
   * but any derivated calculation should be done here.
   *
   * @param changedOptions Object with only the changed options
   */
  // tslint:disable-next-line:prefer-function-over-method
  protected updateOptions(changes: GridOptions): void {
    //
  }

  /**
   * Recalculate the start of each grid row and column based in the grid position, size and
   * calculation method
   */
  private recalculateCellSizes(): void {
    this.columnStarts = this.options.calculateStarts(
      this.options.width,
      this.options.columns,
      false,
      this.terminal,
    );
    this.columnStarts.push(this.options.width);
    this.columnStarts = this.columnStarts.map((value) => value + this.options.col);

    this.rowStarts = this.options.calculateStarts(
      this.options.height,
      this.options.rows,
      true,
      this.terminal,
    );
    this.rowStarts.push(this.options.height);  // where starts the end, for calculating widget sizes
    this.rowStarts = this.rowStarts.map((value) => value + this.options.line);

    this.align();
  }

  /**
   * Handler for the Terminal RESIZED event
   *
   * @param width new size of the terminal in columns
   * @param height new size of the terminal in rows
   */
  private resizedEventHandler(width: number, height: number): void {
    if (this.options.fullSize) {
      const terminalSize = this.terminal.getSize();

      this.setOptions({
        col: 0,
        line: 0,
        width: terminalSize.columns,
        height: terminalSize.rows,
      });
    }
    this.recalculateCellSizes();
  }
}

/**
 * Function that calculates the start tile of each row and column
 *
 * @param available number of tiles availables
 * @param cells number of rows/columns
 * @param isRow `true` when calculating the rows size, `false` for columns
 * @return list with the start tile of each row/column
 */
function calculateStarts(available: number, cells: number): number[] {
  const tilesPerSlot = available / cells;
  const res = [];

  for (let i = 0; i < cells; i++) {
    res.push(Math.round(tilesPerSlot * i));
  }

  return res;
}