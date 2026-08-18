# Easily bulk edit files in Visual Studio Code


## Overview

* Learn how to bulk edit files in Visual Studio Code (VS Code) using the **Change All Occurrences** and **Multi-Cursor Editing** features.
* Customize keybindings to tailor these features to your workflow.
* This guide is for beginner VS Code users on macOS.


## Table of contents <!-- omit in toc -->

* [Overview](#overview)
* [Introduction](#introduction)
* [Preparations](#preparations)
* [Steps to bulk edit files in VS Code](#steps-to-bulk-edit-files-in-vs-code)
* [Customizing keybindings for bulk editing](#customizing-keybindings-for-bulk-editing)
* [Restrictions](#restrictions)
* [Troubleshooting](#troubleshooting)
* [FAQs](#faqs)


## Introduction

This guide will walk you through using the **Change All Occurrences** and **Multi-cursor editing** features to modify multiple lines or text snippets efficiently. It is intended for users looking to enhance their editing speed. By the end of this guide, you will be able to **make bulk edits across multiple lines of text quickly**.

> [!NOTE] Note: Keybindings may differ for Windows users.
> Please refer to the [Keyboard shortcuts for Windows](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf) VS Code document.


## Preparations

Before beginning, make sure to:

1. **Open Visual Studio Code** - Install [Visual Studio Code](https://code.visualstudio.com/) if you have not already done so.
2. **Have a workspace or file open** - You need an open file or project to work with bulk edit features. A long file with repeated text or similar lines is ideal for practice.


## Steps to bulk edit files in VS Code


### Using Change All Occurrences

The **Change All Occurrences** feature in VS Code allows you to select all instances of a word or selection and edit them simultaneously. This feature is helpful for fixing typos or changing variable names across the entire document.

1. **Select the word or text**  
   Highlight the text snippet you want to edit with your cursor.

2. **Invoke Change All Occurrences**  
   Press `Command (⌘) + Shift + L` to highlight all occurrences of the selected text.

3. **Edit the text**  
   With all instances selected, type to edit. Changes you make will apply to each selected instance.

> [!TIP] Tip: Trigger Change All Occurrences from context menu
> You can also use the **Change All Occurrences** feature by right-clicking on the selected text and choosing **Change All Occurrences** from the context menu.


### Using multi-cursor editing

**Multi-cursor editing** allows you to place multiple cursors in different parts of your file, enabling simultaneous editing in those locations. This feature is useful for making similar changes, such as to Markdown lists or CSS properties.

1. **Place multiple cursors**  
   To place a cursor on multiple lines, hold `Option` and click on each line where you want a cursor. You can also hold `Command (⌘) + Option + Down Arrow` or `Command (⌘) + Option + Up Arrow` to add a cursor on the line below or above, respectively.

2. **Edit the lines simultaneously**  
   Once your cursors are in place, type to make changes. Each cursor will apply your edits to its position.


### Using Add Cursors to Line Ends

Similar to multi-cursor editing, you can add cursors to the end of each line in a selection. This is useful when you want to edit a section of a file in the same way (for example, adding a period at the end of each line).

1. **Select the lines**  
   Highlight the lines you want to edit.

2. **Add Cursors to Line Ends**  
   Open the command palette by pressing `Command (⌘) + Shift + P` and type `Add Cursors to Line Ends`. Select this option to place a cursor at the end of each line.

3. **Edit the lines simultaneously**  
   Type to make changes. Each cursor will apply your edits to its position.


## Customizing keybindings for bulk editing

VS Code allows you to customize keybindings for nearly all features, including **Change All Occurrences** and **multi-cursor editing**. By assigning custom shortcuts, you can streamline your workflow and make bulk editing even more efficient.

1. **Open Keyboard Shortcuts**  
   Go to `Code > Preferences > Keyboard Shortcuts` or use the shortcut `Command (⌘) + K, Command (⌘) + S`.

2. **Search for Change All Occurrences**  
   In the search bar, type `Change All Occurrences` to locate this feature. Right-click and select **Change Keybinding** to assign a new shortcut.

3. **Search for multi-cursor keybindings**  
   Search for `Add Cursor Above` or `Add Cursor Below` to adjust multi-cursor shortcuts. Right-click and select **Change Keybinding** to modify these as well.

4. **Search for Add Cursors to Line Ends**  
   Search for `Add Cursors to Line Ends` to adjust the shortcut for this feature. Right-click and select **Change Keybinding** to assign a new shortcut.

5. **Save and test the new keybindings**  
   After adjusting your shortcuts, test them in a file to ensure they work as expected.

> [!TIP] Tip: Export your custom keybindings
> You can easily export your custom keybindings to a file for backup or sharing with others by using the `Preferences: Open Keyboard Shortcuts (JSON)` command from the command palette to access the `keybindings.json` file.


## Restrictions

The **Change All Occurrences** and **multi-cursor editing** features are limited to individual files. They do not apply across multiple open files or the entire project. For project-wide modifications, consider using **Find and Replace** across files (`Command (⌘) + Shift + F`).


## Troubleshooting

* For more information on macOS-specific VS Code keybindings, refer to the [Visual Studio Code Keyboard Shortcuts Reference for macOS](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf).
* For more information on VS Code editing features, refer to the [Basic Editing in Visual Studio Code](https://code.visualstudio.com/docs/editor/codebasics#_multiple-selections-multicursor) documentation.


## FAQs

Here are some frequently asked questions about bulk editing in VS Code.


### Q1. Can I undo changes made with Change All Occurrences?

* Yes, you can undo changes by pressing `Command (⌘) + Z`. This will revert the most recent bulk edit action.


### Q2. How can I select only specific words for multi-cursor editing?

* For more selective multi-cursor editing, use the **Find Selection** feature. Highlight the word, and press `Command (⌘) + D` to select additional instances one at a time.
