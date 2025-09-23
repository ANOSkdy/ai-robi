import React from 'react';
import { describe, expect, it } from 'vitest';
import LoadingModal from './LoadingModal';

describe('LoadingModal', () => {
  it('returns null when loading flag is false', () => {
    expect(LoadingModal({ loading: false })).toBeNull();
  });

  it('renders overlay when loading flag is true', () => {
    const overlay = LoadingModal({ loading: true, message: 'テスト中' });
    expect(overlay).toBeTruthy();
    expect(overlay.type).toBe('div');
    expect(overlay.props.className).toBe('modal-overlay');

    const content = overlay.props.children;
    expect(content.props.className).toBe('modal-content');
    const children = React.Children.toArray(content.props.children);
    const paragraph = children.find((child) => child.type === 'p');
    expect(paragraph.props.children).toBe('テスト中');
  });
});
