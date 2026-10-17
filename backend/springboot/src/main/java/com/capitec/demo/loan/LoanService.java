package com.capitec.demo.loan;

import java.util.List;

import org.springframework.stereotype.Service;

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
}
