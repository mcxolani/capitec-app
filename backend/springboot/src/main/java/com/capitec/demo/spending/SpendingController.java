package com.capitec.demo.spending;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customers/{customerId}")
public class SpendingController {
    private final SpendingService spendingService;

    public SpendingController(SpendingService spendingService) {
        this.spendingService = spendingService;
    }

    @GetMapping("/profile")
    public CustomerProfile getProfile(@PathVariable String customerId) {
        return spendingService.getProfile(customerId);
    }

    @GetMapping("/spending/summary")
    public SpendingSummary getSummary(
            @PathVariable String customerId,
            @RequestParam(defaultValue = "30d") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String category
    ) {
        return spendingService.getSummary(customerId, period, startDate, endDate, category);
    }

    @GetMapping("/spending/categories")
    public SpendingCategories getCategories(
            @PathVariable String customerId,
            @RequestParam(defaultValue = "30d") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String category
    ) {
        return spendingService.getCategories(customerId, period, startDate, endDate, category);
    }

    @GetMapping("/spending/trends")
    public SpendingTrends getTrends(
            @PathVariable String customerId,
            @RequestParam(defaultValue = "12") int months,
            @RequestParam(required = false) String category
    ) {
        return spendingService.getTrends(customerId, months, category);
    }
}
