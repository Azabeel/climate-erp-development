package ru.servisklimat.domain.service;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Calculates markup and sale price for purchase items.
 *
 * Two input modes (from CLAUDE.md §4 «Наценка на ЗИП»):
 *   Mode 1 – markupPercent given → salePrice = purchasePrice × (1 + markupPercent/100)
 *   Mode 2 – markupAmount  given → salePrice = purchasePrice + markupAmount
 *   Mode 3 – neither given  → apply default markup percent (30 % if not specified)
 */
@Component
public class MarkupCalculationService {

    private static final BigDecimal DEFAULT_MARKUP_PERCENT = new BigDecimal("30");
    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;

    /**
     * Result record holding all three derived values.
     */
    public record MarkupResult(
            BigDecimal salePrice,
            BigDecimal markupPercent,
            BigDecimal markupAmount
    ) {}

    /**
     * Calculate with explicit default markup percent.
     *
     * @param purchasePrice      cost price (must be ≥ 0; if zero, division is skipped)
     * @param markupPercent      null → not provided
     * @param markupAmount       null → not provided
     * @param defaultMarkupPercent applied when both markupPercent and markupAmount are null
     */
    public MarkupResult calculateWithDefault(
            BigDecimal purchasePrice,
            BigDecimal markupPercent,
            BigDecimal markupAmount,
            BigDecimal defaultMarkupPercent) {

        if (markupPercent != null) {
            return byPercent(purchasePrice, markupPercent);
        } else if (markupAmount != null) {
            return byAmount(purchasePrice, markupAmount);
        } else {
            BigDecimal pct = defaultMarkupPercent != null ? defaultMarkupPercent : DEFAULT_MARKUP_PERCENT;
            return byPercent(purchasePrice, pct);
        }
    }

    /**
     * Calculate using 30% as fallback default.
     */
    public MarkupResult calculate(
            BigDecimal purchasePrice,
            BigDecimal markupPercent,
            BigDecimal markupAmount) {
        return calculateWithDefault(purchasePrice, markupPercent, markupAmount, DEFAULT_MARKUP_PERCENT);
    }

    // ─── private helpers ────────────────────────────────────────────────────────

    private MarkupResult byPercent(BigDecimal purchasePrice, BigDecimal markupPercent) {
        // salePrice = purchasePrice * (1 + markupPercent / 100)
        BigDecimal factor = BigDecimal.ONE.add(
                markupPercent.divide(new BigDecimal("100"), SCALE + 4, ROUNDING));
        BigDecimal salePrice = purchasePrice.multiply(factor).setScale(SCALE, ROUNDING);
        BigDecimal amount = salePrice.subtract(purchasePrice).setScale(SCALE, ROUNDING);
        BigDecimal pct = markupPercent.setScale(SCALE, ROUNDING);
        return new MarkupResult(salePrice, pct, amount);
    }

    private MarkupResult byAmount(BigDecimal purchasePrice, BigDecimal markupAmount) {
        BigDecimal salePrice = purchasePrice.add(markupAmount).setScale(SCALE, ROUNDING);
        BigDecimal amount = markupAmount.setScale(SCALE, ROUNDING);

        // Guard against division-by-zero when purchasePrice is 0
        BigDecimal pct;
        if (purchasePrice.compareTo(BigDecimal.ZERO) == 0) {
            pct = BigDecimal.ZERO.setScale(SCALE, ROUNDING);
        } else {
            pct = markupAmount
                    .divide(purchasePrice, SCALE + 4, ROUNDING)
                    .multiply(new BigDecimal("100"))
                    .setScale(SCALE, ROUNDING);
        }
        return new MarkupResult(salePrice, pct, amount);
    }
}
