package com.capitec.demo.loan;

import java.util.ArrayList;
import java.util.List;

import com.capitec.demo.loan.RateResponse.PaymentScheduleEntry;

public final class LoanCalculator {
    private LoanCalculator() {
    }

    public static RateResponse calculate(double principal, double annualRate, int termMonths) {
        double monthlyRate = annualRate / 100 / 12;
        double monthlyPayment = monthlyPayment(principal, monthlyRate, termMonths);
        double balance = principal;
        double totalRepayment = 0;
        List<PaymentScheduleEntry> schedule = new ArrayList<>();

        for (int month = 1; month <= termMonths; month++) {
            double interest = roundCents(balance * monthlyRate);
            double principalPaid = month == termMonths ? balance : roundCents(monthlyPayment - interest);
            balance = roundCents(balance - principalPaid);
            double payment = roundCents(principalPaid + interest);
            totalRepayment += payment;
            schedule.add(new PaymentScheduleEntry(month, payment, principalPaid, interest, balance));
        }

        totalRepayment = roundCents(totalRepayment);
        return new RateResponse(
                annualRate,
                monthlyPayment,
                roundCents(totalRepayment - principal),
                totalRepayment,
                schedule
        );
    }

    private static double monthlyPayment(double principal, double monthlyRate, int termMonths) {
        if (monthlyRate == 0) return roundCents(principal / termMonths);
        return roundCents(principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -termMonths)));
    }

    private static double roundCents(double amount) {
        return Math.round(amount * 100) / 100.0;
    }
}
