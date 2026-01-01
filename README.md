# table-charts

A web component that converts HTML tables into accessible bar charts.

## Features

- 📊 Convert any HTML table into a visual bar chart
- ♿ Fully accessible with ARIA attributes
- 🎨 Customizable bar colors via CSS custom properties
- ⚙️ Configurable scale steps
- 📱 Responsive and mobile-friendly
- 🎯 Pure web component (no dependencies)
- ⌨️ Full keyboard navigation support

## Installation

```bash
npm install table-charts
```

## Usage

### Basic Example

```html
<script type="module">
  import 'table-charts';
</script>

<table-bar-chart>
  <table>
    <caption>Quarterly Sales</caption>
    <tbody>
      <tr><td>Q1</td><td>$45,000</td></tr>
      <tr><td>Q2</td><td>$62,500</td></tr>
      <tr><td>Q3</td><td>$58,200</td></tr>
      <tr><td>Q4</td><td>$75,800</td></tr>
    </tbody>
  </table>
</table-bar-chart>
```

## Attributes

### `hide-scale`

Hide the scale on the left side of the chart.

```html
<table-bar-chart hide-scale>
  <table>...</table>
</table-bar-chart>
```

### `scale-steps`

Set the number of scale steps to display (minimum 2, default 4).

```html
<table-bar-chart scale-steps="6">
  <table>...</table>
</table-bar-chart>
```

### `stacked`

Render bars as stacked instead of grouped (for multi-series tables only).

```html
<!-- Grouped bars (default) -->
<table-bar-chart>
  <table>...</table>
</table-bar-chart>

<!-- Stacked bars -->
<table-bar-chart stacked>
  <table>...</table>
</table-bar-chart>
```

## Properties

### `hideScale`

Get or set whether the scale is hidden.

```javascript
const chart = document.querySelector('table-bar-chart');
chart.hideScale = true;
```

### `scaleSteps`

Get or set the number of scale steps.

```javascript
const chart = document.querySelector('table-bar-chart');
chart.scaleSteps = 6;
```

### `stacked`

Get or set whether bars are rendered as stacked (only applies to multi-series tables).

```javascript
const chart = document.querySelector('table-bar-chart');
chart.stacked = true;  // Enable stacked mode
chart.stacked = false; // Switch to grouped mode
```

## Multi-Series Support

The component supports tables with multiple value columns. When a table has more than one value column (after the label column), bars are rendered in either grouped or stacked mode:

### Grouped Bars (Default)

```html
<table-bar-chart>
  <table>
    <caption>Revenue by Channel</caption>
    <thead>
      <tr><th>Quarter</th><th>Online</th><th>Retail</th></tr>
    </thead>
    <tbody>
      <tr><td>Q1</td><td>1200</td><td>800</td></tr>
      <tr><td>Q2</td><td>1500</td><td>1200</td></tr>
      <tr><td>Q3</td><td>1800</td><td>1100</td></tr>
    </tbody>
  </table>
</table-bar-chart>
```

### Stacked Bars

```html
<table-bar-chart stacked>
  <table>
    <caption>Revenue by Channel</caption>
    <thead>
      <tr><th>Quarter</th><th>Online</th><th>Retail</th></tr>
    </thead>
    <tbody>
      <tr><td>Q1</td><td>1200</td><td>800</td></tr>
      <tr><td>Q2</td><td>1500</td><td>1200</td></tr>
      <tr><td>Q3</td><td>1800</td><td>1100</td></tr>
    </tbody>
  </table>
</table-bar-chart>
```

## CSS Customization

### `--bar-background-color`

Customize the bar background color.

```css
table-bar-chart {
  --bar-background-color: steelblue;
}
```

## Requirements

- The table must have a `<tbody>` element
- The first column is treated as labels
- The remaining columns are treated as numeric values (supports single or multiple series)
- Values can include currency symbols, commas, or other formatting (they will be parsed)
- Optional: `<thead>` with column headers for series names (displayed in legends for multi-series)

## Browser Support

Works in all modern browsers that support:
- Web Components (Custom Elements, Shadow DOM)
- ES2020+

## License

MIT
