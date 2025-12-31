/**
 * RowValue - Represents a single data row extracted from the table
 */
export interface RowValue {
    /** The label for the bar (from first column) */
    label: string;
    /** The numeric value for the bar (from second column) */
    value: number;
    /** The original string value from the table cell */
    rawValue: string;
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
 * <table-bar-chart hide-scale>
 *   <table>
 *     <caption>Sales Data</caption>
 *     <tbody>
 *       <tr><td>Q1</td><td>$1,200</td></tr>
 *       <tr><td>Q2</td><td>$1,800</td></tr>
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
