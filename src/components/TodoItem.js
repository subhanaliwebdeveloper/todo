/**
 * TodoItem Component
 * Renders an individual task card with:
 * - Checkbox to toggle completed/pending status
 * - Title (strikethrough and dimmed text when completed)
 * - Description & formatted creation timestamp
 * - Edit button (triggers onEdit prop)
 * - Delete button (triggers confirmation Alert before calling onDelete prop)
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';

const TodoItem = ({ todo, onToggle, onEdit, onDelete }) => {
  const { _id, title, description, completed, createdAt } = todo;

  // Format creation timestamp
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  // Prompt confirmation Alert before executing task deletion
  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(_id),
        },
      ]
    );
  };

  return (
    <View style={[styles.card, completed && styles.cardCompleted]}>
      {/* Checkbox Toggle Button */}
      <TouchableOpacity
        style={styles.checkboxTouch}
        onPress={() => onToggle(_id)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.checkbox,
            completed ? styles.checkboxChecked : styles.checkboxUnchecked,
          ]}
        >
          {completed && (
            <Ionicons name="checkmark-sharp" size={16} color={COLORS.white} />
          )}
        </View>
      </TouchableOpacity>

      {/* Todo Content Details */}
      <View style={styles.contentContainer}>
        <Text
          style={[
            styles.title,
            completed && styles.titleCompleted,
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>

        {description ? (
          <Text
            style={[
              styles.description,
              completed && styles.descriptionCompleted,
            ]}
            numberOfLines={3}
          >
            {description}
          </Text>
        ) : null}

        <View style={styles.footerRow}>
          {formattedDate ? (
            <View style={styles.dateBadge}>
              <Ionicons name="time-outline" size={12} color={COLORS.textLight} />
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
          ) : null}

          <View
            style={[
              styles.statusBadge,
              completed ? styles.statusCompleted : styles.statusPending,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                completed
                  ? styles.statusTextCompleted
                  : styles.statusTextPending,
              ]}
            >
              {completed ? 'Completed' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons (Edit & Delete) */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => onEdit(todo)}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil" size={16} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardCompleted: {
    backgroundColor: '#F8FAFC',
    borderColor: COLORS.border,
    opacity: 0.8,
  },
  checkboxTouch: {
    paddingTop: 2,
    paddingRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxUnchecked: {
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: COLORS.white,
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  contentContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
    lineHeight: 22,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight,
  },
  description: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 8,
    lineHeight: 19,
  },
  descriptionCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  statusPending: {
    backgroundColor: COLORS.warningLight,
  },
  statusCompleted: {
    backgroundColor: COLORS.successLight,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextPending: {
    color: '#B45309',
  },
  statusTextCompleted: {
    color: '#047857',
  },
  actionsContainer: {
    flexDirection: 'column',
    gap: 6,
    marginLeft: 4,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: COLORS.primaryLight,
  },
  deleteBtn: {
    backgroundColor: COLORS.dangerLight,
  },
});

export default TodoItem;
