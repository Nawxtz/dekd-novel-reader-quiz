import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { BannerCarousel } from "../src/components/BannerCarousel";
import { MOCK_BANNERS } from "../src/data/mockNovels";
import { I18nProvider } from "../src/context/I18nContext";

const renderCarousel = () => {
  return render(
    <I18nProvider>
      <BannerCarousel banners={MOCK_BANNERS} />
    </I18nProvider>
  );
};

describe("BannerCarousel", () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  it("renders the banner carousel with active and peeking slides", () => {
    renderCarousel();
    const carousel = screen.getByTestId("banner-carousel");
    expect(carousel).toBeInTheDocument();
    // The active banner title should be present
    expect(screen.getByText(MOCK_BANNERS[0].title)).toBeInTheDocument();
  });

  it("navigates to next and previous slides via arrow buttons", () => {
    renderCarousel();
    const nextBtn = screen.getByLabelText("Next banner");
    const prevBtn = screen.getByLabelText("Previous banner");

    fireEvent.click(nextBtn);
    expect(screen.getByText(MOCK_BANNERS[1].title)).toBeInTheDocument();

    fireEvent.click(prevBtn);
    expect(screen.getByText(MOCK_BANNERS[0].title)).toBeInTheDocument();
  });

  it("toggles play and pause state with the WCAG 2.2.2 control button", () => {
    renderCarousel();
    const pauseBtn = screen.getByLabelText("หยุดภาพสไลด์ชั่วคราว");
    expect(pauseBtn).toBeInTheDocument();

    fireEvent.click(pauseBtn);
    const playBtn = screen.getByLabelText("เล่นภาพสไลด์อัตโนมัติ");
    expect(playBtn).toBeInTheDocument();
  });
});
