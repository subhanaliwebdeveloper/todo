/**
 * TodoListScreen Component
 * Displays the list of tasks belonging exclusively to the authenticated user.
 * Supports:
 * - Loading and empty states
 * - Pull-to-refresh (RefreshControl)
 * - Auto-refetch on navigation focus (useFocusEffect)
 * - Completion toggle (with optimistic UI update)
 * - Task deletion (with confirmation Alert)
 * - Real-time task search and filter tabs (All, Pending, Completed)
 * - Floating "+" action button (FAB) to navigate to AddEditTodoScreen
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { COLORS, RADIUS } from '../constants/theme';
import apiClient from '../api/client';
import TodoItem from '../components/TodoItem';
import LoadingIndicator from '../components/LoadingIndicator';
import EmptyState from '../components/EmptyState';

const TodoListScreen = ({ navigation }) => {
  const { user } = useAuth();

  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'COMPLETED'
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Fetch todos for the authenticated user from the backend
   */
  const fetchTodos = async (showSpinner = true) => {
    if (showSpinner) setIsLoading(true);
    try {
      const response = await apiClient.get('/todos');
      if (response.data.success) {
        setTodos(response.data.todos || []);
      }
    } catch (error) {
      console.error('[TodoListScreen] Fetch error:', error);
      Alert.alert('Error', error.friendlyMessage || 'Failed to load tasks from server.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  /**
   * Refetch todos every time screen gains focus
   */
  useFocusEffect(
    useCallback(() => {
      fetchTodos(todos.length === 0);
    }, [])
  );

  /**
   * Pull-to-refresh handler
   */
  const onRefresh = () => {
    setIsRefreshing(true);
    fetchTodos(false);
  };

  /**
   * Toggle task completion status
   */
  const handleToggle = async (id) => {
    // Optimistic UI update
    const previous = [...todos];
    setTodos((current) =>
      current.map((item) =>
        item._id === id ? { ...item, completed: !item.completed } : item
      )
    );

    try {
      const response = await apiClient.patch(`/todos/${id}/toggle`);
      if (response.data.success) {
        // Sync with updated server state
        setTodos((current) =>
          current.map((item) => (item._id === id ? response.data.todo : item))
        );
      }
    } catch (error) {
      setTodos(previous); // Revert on failure
      Alert.alert('Error', error.friendlyMessage || 'Failed to toggle task status.');
    }
  };

  /**
   * Delete task
   */
  const handleDelete = async (id) => {
    try {
      const response = await apiClient.delete(`/todos/${id}`);
      if (response.data.success) {
        setTodos((current) => current.filter((item) => item._id !== id));
      }
    } catch (error) {
      Alert.alert('Error', error.friendlyMessage || 'Failed to delete task.');
    }
  };

  /**
   * Navigate to AddEditTodoScreen in edit mode
   */
  const handleEdit = (todo) => {
    navigation.navigate('AddEditTodo', { todo });
  };

  // Filter and search logic
  const filteredTodos = todos.filter((todo) => {
    if (activeFilter === 'PENDING' && todo.completed) return false;
    if (activeFilter === 'COMPLETED' && !todo.completed) return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = todo.title.toLowerCase().includes(query);
      const matchDesc = todo.description?.toLowerCase().includes(query);
      return matchTitle || matchDesc;
    }
    return true;
  });

  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;

  if (isLoading && !isRefreshing) {
    return <LoadingIndicator message="Loading your tasks..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header Banner with User Name & Stats */}
      <View style={styles.headerCard}>
        <View style={styles.greetingRow}>
          <Text style={styles.greetingSub}>Welcome back,</Text>
          <Text style={styles.greetingName}>{user?.name || 'Task Master'} 👋</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.statBoxTotal]}>
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxPending]}>
            <Text style={[styles.statNumber, styles.statNumberPending]}>
              {pendingCount}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxCompleted]}>
            <Text style={[styles.statNumber, styles.statNumberCompleted]}>
              {completedCount}
            </Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={COLORS.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'ALL' && styles.filterTabActive]}
          onPress={() => setActiveFilter('ALL')}
        >
          <Text style={[styles.filterTabText, activeFilter === 'ALL' && styles.filterTabTextActive]}>
            All ({totalCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'PENDING' && styles.filterTabActive]}
          onPress={() => setActiveFilter('PENDING')}
        >
          <Text style={[styles.filterTabText, activeFilter === 'PENDING' && styles.filterTabTextActive]}>
            Pending ({pendingCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'COMPLETED' && styles.filterTabActive]}
          onPress={() => setActiveFilter('COMPLETED')}
        >
          <Text style={[styles.filterTabText, activeFilter === 'COMPLETED' && styles.filterTabTextActive]}>
            Completed ({completedCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* FlatList of User's Todos */}
      <FlatList
        data={filteredTodos}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TodoItem
            todo={item}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          filteredTodos.length === 0 && { flexGrow: 1, justifyContent: 'center' },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            iconName={searchQuery ? 'search-outline' : 'checkbox-outline'}
            title={searchQuery ? 'No matching tasks' : 'No tasks in this list'}
            description={
              searchQuery
                ? 'Try searching with another keyword.'
                : activeFilter === 'ALL'
                ? 'Tap the floating "+" button below to add your first task.'
                : `You don't have any ${activeFilter.toLowerCase()} tasks right now.`
            }
            buttonTitle={activeFilter === 'ALL' && !searchQuery ? 'Add New Task' : undefined}
            onButtonPress={() => navigation.navigate('AddEditTodo')}
          />
        }
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditTodo')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerCard: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  greetingRow: {
    marginBottom: 14,
  },
  greetingSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  statBoxTotal: {
    backgroundColor: COLORS.primaryLight,
  },
  statBoxPending: {
    backgroundColor: COLORS.warningLight,
  },
  statBoxCompleted: {
    backgroundColor: COLORS.successLight,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  statNumberPending: {
    color: '#B45309',
  },
  statNumberCompleted: {
    color: '#047857',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    paddingVertical: 6,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    backgroundColor: '#E2E8F0',
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textBody,
  },
  filterTabTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});

export default TodoListScreen;
