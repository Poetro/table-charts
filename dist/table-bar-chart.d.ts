/**
 * SeriesValue - Represents a single value within a series
 */
export interface SeriesValue {
    /** The original string value from the table cell */
    rawValue: string;
    /** The parsed numeric value for calculations */
    numeric: number;
}

/**
 * RowValue - Represents a single data row extracted from the table
 */
export interface RowValue {
    /** The label for the bar (from first column) */
    label: string;
    /** Array of values for this row (one per series) */
    values: SeriesValue[];
}

/**
 * TableBarChart - A web component that converts an HTML table into an accessible bar chart
 * 
 * @example
 * ```html
 * <script type="module">
 *   import 'table-charts';
 * </script>
 * 
 * <!-- Single series example -->
 * <table-bar-chart hide-scale scale-steps="5">
 *   <table>
 *     <caption>Quarterly Sales</caption>
 *     <thead>
 *       <tr><th>Quarter</th><th>Revenue</th></tr>
 *     </thead>
 *     <tbody>
 *       <tr><td>Q1</td><td>$1,200</td></tr>
 *       <tr><td>Q2</td><td>$1,800</td></tr>
 *     </tbody>
 *   </table>
 * </table-bar-chart>
 * 
 * <!-- Multi-series example with stacked bars -->
 * <table-bar-chart stacked>
 *   <table>
 *     <caption>Revenue by Channel</caption>
 *     <thead>
 *       <tr><th>Quarter</th><th>Online</th><th>Retail</th></tr>
 *     </thead>
 *     <tbody>
 *       <tr><td>Q1</td><td>1200</td><td>800</td></tr>
 *       <tr><td>Q2</td><td>1500</td><td>1200</td></tr>
 *     </tbody>
 *   </table>
 * </table-bar-chart>
 * ```
 */
export class TableBarChart extends HTMLElement {
    /**
     * Whether to hide the scale on the left side of the chart
     * Can be set via the `hide-scale` attribute or this property
     * 
     * @example
     * ```javascript
     * chart.hideScale = true;
     * chart.hideScale = false;
     * ```
     */
    hideScale: boolean;

    /**
     * Number of scale steps to display (minimum 2, default 4)
     * Can be set via the `scale-steps` attribute or this property
     * 
     * @example
     * ```javascript
     * chart.scaleSteps = 6;
     * ```
     */
    scaleSteps: number;

    /**
     * Whether to render bars as stacked (for multi-series tables) instead of grouped
     * Can be set via the `stacked` attribute or this property
     * Only applies when the table has multiple value columns (series)
     * 
     * @example
     * ```javascript
     * chart.stacked = true;  // Enable stacked mode
     * chart.stacked = false; // Switch to grouped mode
     * ```
     */
    stacked: boolean;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "table-bar-chart": TableBarChartAttributes;
        }
    }

    interface HTMLElementTagNameMap {
        "table-bar-chart": TableBarChart;
    }
}

/**
 * Attributes for the table-bar-chart element
 */
export interface TableBarChartAttributes
    extends React.DetailedHTMLProps<
        React.HTMLAttributes<TableBarChart>,
        TableBarChart
    > {
    /**
     * Hide the scale on the left side of the chart
     */
    "hide-scale"?: boolean | string;

    /**
     * Number of scale steps to display (minimum 2, default 4)
     */
    "scale-steps"?: number | string;

    /**
     * Render bars as stacked (for multi-series tables) instead of grouped
     * Only applies when the table has multiple value columns (series)
     */
    "stacked"?: boolean | string;

    /**
     * CSS custom property to control the bar background color
     * @example
     * ```html
     * <table-bar-chart style="--bar-background-color: #3b82f6;">
     * ```
     */
    style?: React.CSSProperties & {
        "--bar-background-color"?: string;
    };
}

export default TableBarChart;
