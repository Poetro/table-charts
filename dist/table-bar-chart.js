/**
 * @typedef SeriesValue
 * @property {string} rawValue - The original string value from the table cell
 * @property {number} numeric - The parsed numeric value for calculations
 */

/**
 * @typedef RowValue
 * @property {string} label - The label for the bar (from first column)
 * @property {SeriesValue[]} values - Array of values for this row (one per series)
 */

/**
 * TableBarChart - A web component that converts HTML tables into accessible bar charts
 *
 * @extends {HTMLElement} Use HTMLElement as the base class for the custom element using Web Components API as the `<table-bar-chart>` tag.
 * @example
 * <table-bar-chart hide-scale scale-steps="5">
 *   <caption>Sales Data</caption>
 *   <table>
 *     <thead>
 *      <tr><th>Product</th><th>Sales</th></tr>
 *     </thead>
 *     <tbody>
 *       <tr><td>Product A</td><td>$1,200</td></tr>
 *       <tr><td>Product B</td><td>$900</td></tr>
 *       <tr><td>Product C</td><td>$1,500</td></tr>
 *     </tbody>
 *   </table>
 * </table-bar-chart>
 * @attribute {boolean} hide-scale - Hides the scale on the left side of the chart when present
 * @attribute {number} scale-steps - Number of steps/values to show on the scale (default: 4)
 * @attribute {boolean} stacked - Renders bars as stacked (for multi-series tables) instead of grouped
 */
class TableBarChart extends HTMLElement {
  static get observedAttributes() {
    return ["hide-scale", "scale-steps", "stacked"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.#setupObserver();
  }

  disconnectedCallback() {
    // Clean up the observer when the element is removed from the DOM
    if (this.#observer) {
      this.#observer.disconnect();
      this.#observer = null;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "hide-scale" || name === "scale-steps" || name === "stacked") {
      this.#extractDataAndDraw();
    }
  }

  get hideScale() {
    return this.hasAttribute("hide-scale")
      ? this.getAttribute("hide-scale") !== "false"
      : false;
  }

  set hideScale(value) {
    if (value) {
      this.setAttribute("hide-scale", "");
    } else {
      this.removeAttribute("hide-scale");
    }
  }

  get scaleSteps() {
    const steps = parseInt(this.getAttribute("scale-steps") || "4", 10);
    return isNaN(steps) || steps < 2 ? 4 : steps;
  }

  set scaleSteps(value) {
    if (typeof value === "number" && value >= 2) {
      this.setAttribute("scale-steps", String(value));
    } else {
      this.removeAttribute("scale-steps");
    }
  }

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
   *
   * @returns {boolean} True if stacked mode is enabled
   */
  get stacked() {
    return this.hasAttribute("stacked")
      ? this.getAttribute("stacked") !== "false"
      : false;
  }

  /**
   * Set whether to render bars as stacked
   *
   * @param {boolean} value - If true, enables stacked mode; if false, disables it
   */
  set stacked(value) {
    if (value) {
      this.setAttribute("stacked", "");
    } else {
      this.removeAttribute("stacked");
    }
  }

  /**
   * Sets up the Shadow DOM structure and styles
   */
  render() {
    this.shadowRoot.innerHTML = `
      <style>
:host {
  background-color: Canvas;
  color: CanvasText;
  display: flex;
  flex: 1 1 auto;
  align-items: stretch;
  --bar-background-color: ActiveText;
  height: 300px;
}

/* Hide the slotted table visually but keep it accessible */
::slotted(table),
.visually-hidden {
  border: 0;
  clip: rect(0, 0, 0, 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  pointer-events: none;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

.flex {
  display: flex;
  flex: 1 1 auto;
  align-items: stretch;
}

.chart-wrapper {
  flex-direction: column;
  gap: 1rem;
  padding: 0;
  margin: 0;
}

.caption {
  text-align: center;
}

.chart-container.hide-scale > .scale {
  display: none;
}

.scale {
  border-inline-end: 1px solid GrayText;
  color: GrayText;
  flex-direction: column;
  flex: 0 0 auto;
  font-size: 0.75rem;
  justify-content: space-between;
  margin-block-end: 1.5rem;
  min-width: 3rem;
  padding-inline-end: 0.5rem;
  text-align: end;
}

.scale-value {
  height: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.bars-wrapper {
  justify-content: space-around;
  margin: 0;
  padding: 0;
  border: none;
}

.grouped-bars {
  gap: 0.5rem;
  justify-content: center;
  align-self: stretch;
}

.grouped-bars .bar {
  align-self: flex-end;
}

.bar.segment:hover,
.bar.segment:focus-visible {
  z-index: 1;
}

.bar-group {
  border: none;
  flex-direction: column;
  justify-content: flex-end;
  margin: 0;
  padding: 0;
}

.stack {
  flex: 0 1 auto;
}

.bar {
  align-self: center;
  background-color: var(--bar-background-color);
  border-radius: 4px 4px 0 0;
  border-width: 1px;
  box-sizing: border-box;
  color: Canvas;
  margin-bottom: -1px;
  max-width: 2rem;
  position: relative;
  transition: height 0.3s ease;
  width: 100%;
}

.segment + .segment {
  border-radius: 0;
}

.bar:hover,
.bar:focus-visible {
  outline: 2px solid ButtonBorder;
  outline-offset: 2px;
  z-index: 1;
}

/* Tooltip-like value on hover and focus */
.bar:hover::after,
.bar:focus-visible::after {
  background: CanvasText;
  border-radius: 4px;
  color: Canvas;
  content: attr(value);
  font-size: 0.8rem;
  inset: -2rem auto auto 50%;
  padding: 4px 8px;
  position: absolute;
  transform: translateX(-50%);
  white-space: nowrap;
}

.label {
  border-top: 1px solid GrayText;
  color: ButtonText;
  display: -webkit-box;
  flex: 0 0 1.5rem;
  font-size: 0.85rem;
  line-clamp: 1;
  line-height: 1.5rem;
  order: 1;
  overflow: hidden;
  position: relative;
  text-align: center;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
legend.label {
  float: inline-start;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .bar {
    transition: none;
  }
}
      </style>
      
      <slot></slot>
      
      <figure class="chart-wrapper flex">
        <figcaption id="caption" class="caption"></figcaption>
        <div id="chart" class="chart-container flex" role="img" aria-labelledby="caption">
          <div id="scale" class="scale flex" aria-hidden="true"></div>
          <fieldset id="bars" class="bars-wrapper flex"></fieldset>
        </div>
      </figure>
    `;

    // Listen for when the user puts a table into the slot
    const slot = this.shadowRoot.querySelector("slot");
    slot.addEventListener("slotchange", () => {
      this.#extractDataAndDraw();
      this.#setupObserver(); // Re-attach observer if the element changes
    });
  }

  /**
   * MutationObserver to watch for changes in the slotted table
   * @type {MutationObserver|null}
   */
  #observer = null;

  /**
   * Watches the light DOM table for data changes to auto-update the chart
   */
  #setupObserver() {
    const slot = this.shadowRoot.querySelector("slot");
    const nodes = slot.assignedElements();

    // Disconnect old observer if exists
    if (this.#observer) this.#observer.disconnect();

    if (nodes.length > 0 && nodes[0].tagName === "TABLE") {
      const table = nodes[0];

      this.#observer = new MutationObserver(() => {
        this.#extractDataAndDraw();
      });

      // Watch for changes to text content or child lists (rows added/removed)
      this.#observer.observe(table, {
        characterData: true,
        childList: true,
        subtree: true,
      });
    }
  }

  #extractDataAndDraw() {
    const slot = this.shadowRoot.querySelector("slot");
    const nodes = slot?.assignedElements() ?? [];

    if (nodes.length === 0 || nodes[0].tagName !== "TABLE") return;

    const table = nodes[0];

    // Extract caption if present
    const caption = table.querySelector("caption");
    const captionElement = this.shadowRoot.getElementById("caption");
    if (caption) {
      captionElement.replaceChildren(
        ...Array.from(caption.childNodes).map((n) => n.cloneNode(true))
      );
      captionElement.style.display = "";
    } else {
      captionElement.style.display = "none";
    }

    const rows = Array.from(table.querySelectorAll("tbody tr"));

    // Determine series names from thead if present (columns after first are series)
    const headerCells = Array.from(table.querySelectorAll("thead th")).map(
      (t) => t.textContent.trim()
    );
    const seriesNames = headerCells.length > 1 ? headerCells.slice(1) : [];

    // Parse Data: support label + multiple value columns
    const data = rows
      .map((row) => {
        const cells = row.querySelectorAll("td, th");
        if (cells.length < 2) return null;

        const label = cells[0].textContent.trim();

        // collect values for each subsequent column
        const values = Array.from(cells)
          .slice(1)
          .map((cell) => {
            const rawValue = cell.textContent.trim();
            const numeric =
              parseFloat(rawValue.replace(/^[^\d]+|[^\d]+$|,|\s/g, "")) || 0;
            return { rawValue, numeric };
          });

        return { label, values };
      })
      .filter(Boolean);

    // expose series names to drawing routine
    this.seriesNames = seriesNames;
    this.#drawChart(data);
  }

  /**
   * Renders the bar chart based on extracted data
   * @param {RowValue[]} data
   * @returns
   */
  #drawChart(data) {
    const scaleContainer = this.shadowRoot.getElementById("scale");
    const barsContainer = this.shadowRoot.getElementById("bars");

    if (data.length === 0) {
      barsContainer.replaceChildren();
      return;
    }
    // Determine whether multiple series exist
    const multiSeries = data[0].values && data[0].values.length > 1;

    // Compute normalization values
    let maxValue = 0;
    if (multiSeries) {
      if (this.stacked) {
        // For stacked charts, max is the maximum total across rows
        maxValue = Math.max(
          ...data.map((d) => d.values.reduce((s, v) => s + v.numeric, 0))
        );
      } else {
        // For grouped charts, max is the maximum single series value
        maxValue = Math.max(
          ...data.flatMap((d) => d.values.map((v) => v.numeric))
        );
      }
    } else {
      maxValue = Math.max(...data.map((d) => d.values[0].numeric));
    }

    this.#drawScale(
      scaleContainer,
      maxValue,
      this.hideScale ? 0 : this.scaleSteps
    );

    const groups = data.map((item, index) => {
      const group = document.createElement("fieldset");
      group.className = "bar-group flex";
      const groupId = `bar-group-${index}`;

      if (multiSeries) {
        const legend = document.createElement("legend");
        legend.className = "label";
        legend.append(item.label);
        if (this.stacked) {
          // Stacked: outer bar represents total height, inner segments for each series
          const total = item.values.reduce((s, v) => s + v.numeric, 0) || 0;
          const outer = document.createElement("fieldset");
          outer.className = "bar-group stack flex";
          outer.setAttribute("title", `${item.label}: ${total}`);
          outer.setAttribute("aria-posinset", index + 1);
          outer.setAttribute("aria-setsize", data.length);
          // Set outer height relative to maxValue
          outer.style.height = `${(total / maxValue) * 100}%`;

          // Create segments stacked bottom-up
          item.values.toReversed().forEach((seg, sidx) => {
            const segEl = document.createElement("button");
            segEl.className = `bar segment series-${sidx}`;
            segEl.type = "button";
            segEl.style.height = `${(seg.numeric / total) * 100}%`;
            segEl.value = `${this.seriesNames[sidx] || ""}: ${seg.rawValue}`;
            segEl.title = segEl.value;
            outer.appendChild(segEl);
          });

          group.appendChild(legend);
          group.appendChild(outer);
        } else {
          // Grouped: multiple bars side-by-side within this group
          const wrapper = document.createElement("div");
          wrapper.className = "grouped-bars flex";
          item.values.forEach((v, sidx) => {
            const barId = `bar-${index}-${sidx}`;
            const bar = document.createElement("button");
            bar.type = "button";
            bar.id = barId;
            bar.className = `bar series-${sidx}`;
            bar.style.height = `${(v.numeric / maxValue) * 100}%`;
            bar.value = `${this.seriesNames[sidx] || ""}: ${v.rawValue}`;
            bar.title = bar.value;
            bar.setAttribute("aria-posinset", sidx + 1);
            bar.setAttribute("aria-setsize", item.values.length);
            wrapper.appendChild(bar);
          });
          group.appendChild(legend);
          group.appendChild(wrapper);
        }
      } else {
        const label = document.createElement("label");
        label.className = "label";
        label.append(item.label);
        label.id = groupId;
        group.setAttribute("aria-labelledby", groupId);
        // Single series as before
        const v = item.values[0];
        const bar = document.createElement("button");
        bar.type = "button";
        bar.className = "bar";
        bar.style.flexBasis = `${(v.numeric / maxValue) * 100}%`;
        bar.value = v.rawValue;
        bar.id = `bar-${index}`;
        bar.setAttribute("title", `${item.label}: ${v.rawValue}`);
        bar.setAttribute("aria-posinset", index + 1);
        bar.setAttribute("aria-setsize", data.length);
        label.htmlFor = bar.id;

        group.appendChild(label);
        group.appendChild(bar);
      }

      return group;
    });

    barsContainer.replaceChildren(...groups);
  }

  /**
   * Draws the scale on the left side of the chart
   * @param {HTMLElement} scaleContainer
   * @param {number} maxValue
   * @param {number} steps - Number of scale values to display
   */
  #drawScale(scaleContainer, maxValue, steps = 4) {
    /** @type {HTMLElement[]} */
    const children = [];
    for (let i = steps - 1; i >= 0; i--) {
      const value = (maxValue / (steps - 1)) * i;
      const scaleValue = document.createElement("div");
      scaleValue.append(Math.round(value));
      scaleValue.className = "scale-value";
      children.push(scaleValue);
    }
    scaleContainer.replaceChildren(...children);
    scaleContainer.parentElement.classList.toggle("hide-scale", this.hideScale);
  }
}

customElements.define("table-bar-chart", TableBarChart);

// export { TableBarChart };
// export default TableBarChart;
