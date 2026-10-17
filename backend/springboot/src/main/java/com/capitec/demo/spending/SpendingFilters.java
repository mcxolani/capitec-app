package com.capitec.demo.spending;

import java.util.List;

public record SpendingFilters(List<Category> categories, List<DateRangePreset> dateRangePresets) {
    public record Category(String name, String color, String icon) {}

    public record DateRangePreset(String label, String value) {}
}
