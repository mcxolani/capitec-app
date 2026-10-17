package com.capitec.demo.loan;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/loans")
public class LoanController {
    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @GetMapping("/products")
    public LoanProducts getProducts() {
        return loanService.getProducts();
    }

    @GetMapping("/validation-rules")
    public ValidationRules getValidationRules() {
        return loanService.getValidationRules();
    }

    @PostMapping("/calculate-rate")
    public RateResponse calculateRate(@Valid @RequestBody RateRequest request) {
        return loanService.calculateRate(request);
    }
}
