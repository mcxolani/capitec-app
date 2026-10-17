package com.capitec.demo.loan;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.capitec.demo.loan.LoanProducts.InterestRateRange;
import com.capitec.demo.loan.LoanProducts.Product;
import com.capitec.demo.loan.ValidationRules.FinancialInfo;
import com.capitec.demo.loan.ValidationRules.LoanDetails;
import com.capitec.demo.loan.ValidationRules.MinRule;
import com.capitec.demo.loan.ValidationRules.OptionsRule;
import com.capitec.demo.loan.ValidationRules.PersonalInfo;
import com.capitec.demo.loan.ValidationRules.RangeRule;

@Service
public class LoanService {
    private static final LoanProducts PRODUCTS = new LoanProducts(List.of(
            new Product(
                    "personal_loan",
                    "Personal Loan",
                    "Flexible personal financing for various needs",
                    5_000,
                    300_000,
                    6,
                    60,
                    new InterestRateRange(10.5, 18.5),
                    List.of("debt_consolidation", "home_improvement", "education", "medical", "other")
            ),
            new Product(
                    "vehicle_loan",
                    "Vehicle Finance",
                    "Financing for new and used vehicles",
                    50_000,
                    1_500_000,
                    12,
                    72,
                    new InterestRateRange(8.5, 15.0),
                    List.of("new_vehicle", "used_vehicle")
            )
    ));

    private static final ValidationRules VALIDATION_RULES = new ValidationRules(
            new PersonalInfo(
                    new RangeRule(18, 65, true, "Age must be between 18 and 65"),
                    new OptionsRule(true, List.of("employed", "self_employed", "unemployed", "retired"),
                            "Please select your employment status"),
                    new MinRule(3, true, "Minimum 3 months employment required")
            ),
            new FinancialInfo(
                    new MinRule(5_000, true, "Minimum monthly income of R5,000 required"),
                    new MinRule(0, true, "Please enter your monthly expenses"),
                    new RangeRule(300, 850, false, "Credit score must be between 300 and 850")
            ),
            new LoanDetails(
                    new RangeRule(5_000, 300_000, true,
                            "Loan amount must be between R5,000 and R300,000"),
                    new RangeRule(6, 60, true, "Loan term must be between 6 and 60 months")
            )
    );

    public LoanProducts getProducts() {
        return PRODUCTS;
    }

    public ValidationRules getValidationRules() {
        return VALIDATION_RULES;
    }

    public RateResponse calculateRate(RateRequest request) {
        validateRateRequest(request);
        double interestRate = interestRateFor(request.loanType(), request.creditScore());
        return LoanCalculator.calculate(request.loanAmount(), interestRate, request.loanTerm());
    }

    private void validateRateRequest(RateRequest request) {
        switch (request.loanType()) {
            case "personal_loan" -> {
                if (request.loanAmount() > 300_000 || request.loanTerm() > 60) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount or term is outside personal loan limits");
                }
            }
            case "vehicle_loan" -> {
                if (request.loanAmount() < 50_000 || request.loanTerm() < 12) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount or term is below vehicle loan limits");
                }
            }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported loan type");
        }
    }

    private double interestRateFor(String loanType, Integer creditScore) {
        double personalRate = creditScore == null ? 15.5
                : creditScore >= 750 ? 10.5
                : creditScore >= 650 ? 12.5
                : creditScore >= 550 ? 15.5
                : 18.5;

        if (loanType.equals("personal_loan")) return personalRate;

        double position = (personalRate - 10.5) / (18.5 - 10.5);
        return Math.round((8.5 + position * (15 - 8.5)) * 100) / 100.0;
    }
}
