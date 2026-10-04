/**
 * AddEditTodoScreen Component
 * Unified form used for creating a new task or editing an existing one.
 * Detects mode based on route.params?.todo.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import apiClient from '../api/client';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

const AddEditTodoScreen = ({ navigation, route }) => {
  const existingTodo = route.params?.todo;
  const isEditMode = Boolean(existingTodo);

  const [title, setTitle] = useState(existingTodo?.title || '');
  const [description, setDescription] = useState(existingTodo?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState(null);

  // Set navigation header title dynamically
  useEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Edit Task' : 'New Task',
    });
  }, [navigation, isEditMode]);

  /**
   * Validate required task title
   */
  const validate = () => {
    if (!title.trim()) {
      setTitleError('Task title is required');
      return false;
    }
    setTitleError(null);
    return true;
  };

  /**
   * Save task changes (POST for create, PUT for edit)
   */
  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        // Edit existing todo
        const response = await apiClient.put(`/todos/${existingTodo._id}`, {
          title: title.trim(),
          description: description.trim(),
        });

        if (response.data.success) {
          navigation.goBack();
        }
      } else {
        // Create new todo
        const response = await apiClient.post('/todos', {
          title: title.trim(),
          description: description.trim(),
        });

        if (response.data.success) {
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error('[AddEditTodoScreen] Save error:', error);
      Alert.alert(
        'Save Error',
        error.friendlyMessage || 'Failed to save task. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Hero Box */}
        <View style={styles.headerBox}>
          <View style={styles.iconCircle}>
            <Ionicons
              name={isEditMode ? 'create-outline' : 'add-circle-outline'}
              size={28}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.headerTextBox}>
            <Text style={styles.headerTitle}>
              {isEditMode ? 'Update Task Details' : 'Create a New Task'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isEditMode
                ? 'Make changes to your task title and notes below.'
                : 'Enter task details to keep your workflow organized.'}
            </Text>
          </View>
        </View>

        {/* Input Form Card */}
        <View style={styles.formCard}>
          <CustomInput
            label="Task Title *"
            placeholder="e.g. Complete Project Presentation"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (titleError) setTitleError(null);
            }}
            iconName="document-text-outline"
            error={titleError}
            maxLength={120}
          />

          <CustomInput
            label="Description (Optional)"
            placeholder="Add notes, details, or steps..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
            iconName="reader-outline"
          />

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <CustomButton
              title={isEditMode ? 'Update Task' : 'Save Task'}
              onPress={handleSave}
              variant="primary"
              loading={isSubmitting}
              iconName={isEditMode ? 'checkmark-circle-outline' : 'add-outline'}
              style={styles.saveBtn}
            />

            <CustomButton
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              disabled={isSubmitting}
              style={styles.cancelBtn}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
  },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerTextBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonGroup: {
    marginTop: 12,
    gap: 12,
  },
  saveBtn: {
    width: '100%',
  },
  cancelBtn: {
    width: '100%',
  },
});

export default AddEditTodoScreen;
