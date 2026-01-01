# Changelog

All notable changes to this project will be documented in this file.

## [0.0.2] - 2026-01-01

### Fixed
- Update cell selection to include header cells and improve tooltip values in bar chart

## [0.0.1] - 2025-12-31

### Added
- Initial release
- TableBarChart web component
- Single-series bar chart support
- Multi-series bar chart support (grouped and stacked modes)
- Support for `hide-scale` attribute/property to hide the scale
- Support for `scale-steps` attribute/property to configure scale granularity
- Support for `stacked` attribute/property to toggle between grouped and stacked bars
- Support for `--bar-background-color` CSS custom property to customize bar colors
- Full keyboard navigation support
- ARIA attributes for accessibility
- TypeScript type definitions
- MutationObserver for reactive updates when table data changes
- Proper cleanup on component unmounting
- Support for currency symbols and formatting in numeric values
- Automatic value parsing (removes currency symbols, commas, etc.)
