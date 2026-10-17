package com.capitec.demo.loan;

import java.util.List;

public record RateResponse(
        double interestRate,
        double monthlyPayment,
        double totalInterest,
        double totalRepayment,
        List<PaymentScheduleEntry> paymentSchedule
) {
    public record PaymentScheduleEntry(
            int month,
            double payment,
            double principal,
            double interest,
            double balance
    ) {
    }
}
