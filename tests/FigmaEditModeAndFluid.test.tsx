import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { BookmarkList } from "../src/components/BookmarkList";
import { I18nProvider } from "../src/context/I18nContext";
import { Bookmark } from "../src/types/novel";

const MOCK_ITEMS: Bookmark[] = [
  {
    id: "test-1",
    novelId: "novel-1",
    title: "นิยายเรื่องที่หนึ่ง",
    author: "นักเขียน ก",
    category: "แฟนตาซี",
    currentChapter: 5,
    totalChapters: 20,
    currentChapterTitle: "การเริ่มต้น",
    status: "reading",
    lastReadAt: "2020-07-09T15:56:00.000Z",
    note: "",
    coverUrl: "",
    createdAt: "2020-07-09T15:00:00.000Z",
    updatedAt: "2020-07-09T15:56:00.000Z",
  },
  {
    id: "test-2",
    novelId: "novel-2",
    title: "นิยายเรื่องที่สอง",
    author: "นักเขียน ข",
    category: "รักโรแมนติก",
    currentChapter: 10,
    totalChapters: 30,
    currentChapterTitle: "พบกันอีกครั้ง",
    status: "reading",
    lastReadAt: "2020-07-09T15:56:00.000Z",
    note: "",
    coverUrl: "",
    createdAt: "2020-07-09T15:00:00.000Z",
    updatedAt: "2020-07-09T15:56:00.000Z",
  },
];

describe("BookmarkList and BookmarkCard Figma Edit Mode", () => {
  it("renders fluid container and responsive grid classes", () => {
    render(
      <I18nProvider>
        <BookmarkList
          bookmarks={MOCK_ITEMS}
          isLoading={false}
          searchQuery=""
          isEditMode={false}
          onToggleEditMode={() => {}}
          onOpenAddModal={() => {}}
          onEditBookmark={() => {}}
          onDeleteBookmark={() => {}}
          onBulkDelete={() => {}}
        />
      </I18nProvider>
    );

    const section = document.getElementById("bookmarks-section");
    expect(section).toHaveClass("w-full", "px-4", "sm:px-8", "lg:px-12", "xl:px-16", "2xl:px-20");

    const grid = screen.getByTestId("bookmarks-grid");
    expect(grid).toHaveClass("grid-cols-2", "2xl:grid-cols-5");
  });

  it("renders Figma edit mode pill buttons when isEditMode is true", () => {
    const handleToggleEdit = vi.fn();
    render(
      <I18nProvider>
        <BookmarkList
          bookmarks={MOCK_ITEMS}
          isLoading={false}
          searchQuery=""
          isEditMode={true}
          onToggleEditMode={handleToggleEdit}
          onOpenAddModal={() => {}}
          onEditBookmark={() => {}}
          onDeleteBookmark={() => {}}
          onBulkDelete={() => {}}
        />
      </I18nProvider>
    );

    // Cancel pill button
    const cancelBtn = screen.getByRole("button", { name: "ยกเลิก" });
    expect(cancelBtn).toBeInTheDocument();
    fireEvent.click(cancelBtn);
    expect(handleToggleEdit).toHaveBeenCalled();

    // Delete pill button (initially 0 items, disabled)
    const deleteBtn = screen.getByRole("button", { name: /0 รายการ/ });
    expect(deleteBtn).toBeInTheDocument();
    expect(deleteBtn).toBeDisabled();

    // Click card primary action button to select
    const cardBtn = screen.getByRole("button", { name: /นิยายเรื่องที่หนึ่ง/ });
    fireEvent.click(cardBtn);

    // Delete pill button should now show 1 รายการ and be enabled
    expect(screen.getByRole("button", { name: /1 รายการ/ })).not.toBeDisabled();
  });

  it("in normal mode, displays explicit episode button and navigates to reader page on card click", () => {
    const handleEditBookmark = vi.fn();
    render(
      <I18nProvider>
        <BookmarkList
          bookmarks={MOCK_ITEMS}
          isLoading={false}
          searchQuery=""
          isEditMode={false}
          onToggleEditMode={() => {}}
          onOpenAddModal={() => {}}
          onEditBookmark={handleEditBookmark}
          onDeleteBookmark={() => {}}
          onBulkDelete={() => {}}
        />
      </I18nProvider>
    );

    // Explicit chapter read buttons
    expect(screen.getByText("อ่านต่อ ตอนที่ 5")).toBeInTheDocument();
    expect(screen.getByText("อ่านต่อ ตอนที่ 10")).toBeInTheDocument();

    // Clicking card in normal mode does NOT call onEditBookmark
    const cardBtn = screen.getByRole("button", { name: "นิยายเรื่องที่หนึ่ง - นักเขียน ก" });
    fireEvent.click(cardBtn);
    expect(handleEditBookmark).not.toHaveBeenCalled();
  });

  it("renders quick delete button between +1 Ch. and continue, and triggers deletion upon confirmation", () => {
    const handleDeleteBookmark = vi.fn();
    render(
      <I18nProvider>
        <BookmarkList
          bookmarks={MOCK_ITEMS}
          isLoading={false}
          searchQuery=""
          isEditMode={false}
          onToggleEditMode={() => {}}
          onOpenAddModal={() => {}}
          onDeleteBookmark={handleDeleteBookmark}
          onBulkDelete={() => {}}
        />
      </I18nProvider>
    );

    // Quick delete button is present on the card
    const deleteBtn = screen.getByRole("button", {
      name: "ลบที่คั่น นิยายเรื่องที่หนึ่ง",
    });
    expect(deleteBtn).toBeInTheDocument();

    // Clicking quick delete opens SingleDeleteModal
    fireEvent.click(deleteBtn);

    // Verify modal content
    expect(screen.getByText("ยืนยันการลบที่คั่นนิยาย")).toBeInTheDocument();
    expect(screen.getByText(/ออกจากรายการที่คั่นไว้ใช่หรือไม่/)).toBeInTheDocument();

    // Confirm deletion
    const confirmBtn = screen.getByRole("button", { name: "ลบรายการ" });
    fireEvent.click(confirmBtn);

    expect(handleDeleteBookmark).toHaveBeenCalledWith("test-1");
  });
});
