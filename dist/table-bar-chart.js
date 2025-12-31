/**
 * @typedef RowValue
 * @property {string} label - The label for the bar (from first column)
 * @property {number} value - The numeric value for the bar (from second column)
 * @property {string} rawValue - The original string value from the table cell
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
 */
class TableBarChart extends HTMLElement {
  static get observedAttributes() {
    return ["hide-scale", "scale-steps"];
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
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "hide-scale" || name === "scale-steps") {
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
   * Sets up the Shadow DOM structure and styles
   */
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          background-color: Canvas;
          color: CanvasText;
          display: block;
          --bar-background-color: ActiveText;
        }

        /* Hide the slotted table visually but keep it accessible */
        ::slotted(table) {
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

        .chart-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 0;
          margin: 0;
        }

        .caption {
          font-size: 1rem;
          font-weight: 600;
          text-align: center;
        }

        .chart-container {
          display: flex;
          align-items: flex-end;
        }

        .chart-container.hide-scale > .scale {
          display: none;
        }

        .scale {
          display: flex;
          flex-direction: column;
          align-self: stretch;
          justify-content: space-between;
          border-inline-end: 1px solid GrayText;
          padding-inline-end: 0.5rem;
          text-align: end;
          font-size: 0.75rem;
          color: GrayText;
          min-width: 3rem;
          margin-block-end: 1.5rem;
        }

        .scale-value {
          height: 0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .bars-wrapper {
          flex: 1 1 auto;
          display: flex;
          align-items: stretch;
          justify-content: space-around;
          height: 300px;
        }

        .bar-group {
          border: none;
          display: flex;
          flex-direction: column;
          flex: 1;
          justify-content: flex-end;
          margin: 0;
          padding: 0;
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
          transition: flex-basis 0.3s ease;
          width: 100%;
          z-index: 1;
        }

        .bar:hover,
        .bar:focus-visible {
          outline: 2px solid ButtonBorder;
          outline-offset: 2px;
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
          line-height: 1.5rem;
          overflow: hidden;
          position: relative;
          text-align: center;
          text-overflow: ellipsis;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .bar {
            transition: none;
          }
        }
      </style>
      
      <slot></slot>
      
      <figure class="chart-wrapper">
        <figcaption id="caption" class="caption"></figcaption>
        <div id="chart" class="chart-container" role="img" aria-labelledby="caption">
          <div id="scale" class="scale" aria-hidden="true"></div>
          <div id="bars" class="bars-wrapper"></div>
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
   * Watches the light DOM table for data changes to auto-update the chart
   */
  #setupObserver() {
    const slot = this.shadowRoot.querySelector("slot");
    const nodes = slot.assignedElements();

    // Disconnect old observer if exists
    if (this.observer) this.observer.disconnect();

    if (nodes.length > 0 && nodes[0].tagName === "TABLE") {
      const table = nodes[0];

      this.observer = new MutationObserver(() => {
        this.#extractDataAndDraw();
      });

      // Watch for changes to text content or child lists (rows added/removed)
      this.observer.observe(table, {
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
      captionElement.textContent = caption.textContent;
      captionElement.style.display = "block";
    } else {
      captionElement.style.display = "none";
    }

    const rows = Array.from(table.querySelectorAll("tbody tr"));

    // Parse Data: Assumes Col 1 is Label, Col 2 is Value
    /** @type {RowValue[]} */
    const data = rows
      .map((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 2) return null;

        const label = cells[0].textContent;
        const rawValue = cells[1].textContent;
        // Remove currency symbols or commas to parse number safely
        const value =
          parseFloat(rawValue.replace(/^[^\d]+|[^\d]+$|,|\s/g, "")) || 0;

        return { label, value, rawValue };
      })
      .filter(Boolean);

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
    // Find max value to normalize bar heights
    const maxValue = Math.max(...data.map((d) => d.value));

    this.#drawScale(
      scaleContainer,
      maxValue,
      this.hideScale ? 0 : this.scaleSteps
    );

    const groups = data.map((item, index) => {
      // Calculate height as percentage
      const heightPercent = (item.value / maxValue) * 100;
      const barId = `bar-${index}`;

      const group = document.createElement("fieldset");
      group.className = "bar-group";
      group.setAttribute("aria-labelledby", barId);

      const bar = document.createElement("button");
      bar.type = "button";
      bar.id = barId;
      bar.className = "bar";
      bar.style.flexBasis = `${heightPercent}%`;
      bar.value = item.rawValue;
      bar.setAttribute("title", `${item.label}: ${item.rawValue}`);
      bar.setAttribute("aria-posinset", index + 1);
      bar.setAttribute("aria-setsize", data.length);

      const label = document.createElement("label");
      label.className = "label";
      label.htmlFor = barId;
      label.textContent = item.label;

      group.appendChild(bar);
      group.appendChild(label);
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
