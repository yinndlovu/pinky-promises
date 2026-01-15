// external
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

// internal
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../theme/ThemeContext";
import useToken from "../../../hooks/useToken";
import { usePeriod } from "../../../hooks/usePeriod";
import { usePeriodSelector } from "../../../hooks/usePeriodSelector";
import {
  startPeriod,
  endPeriod,
  markLookoutSeen,
} from "../../../services/api/period/periodService";
import { createPeriodStyles } from "../styles/PeriodScreen.styles";

// components
import PeriodStatusCard from "../components/PeriodStatusCard";
import TodaysIssuesCard from "../components/TodaysIssuesCard";
import PeriodAidsSection from "../components/PeriodAidsSection";
import LookoutsSection from "../components/LookoutsSection";
import PreviousCycleCard from "../components/PreviousCycleCard";
import QuickActionsRow from "../components/QuickActionsRow";
import Shimmer from "../../../components/skeletons/Shimmer";
import ErrorState from "../../../components/common/ErrorState";

// modals
import AddLookoutModal from "../../../components/modals/input/AddLookoutModal";
import IssueDetailModal from "../../../components/modals/output/IssueDetailModal";
import AlertModal from "../../../components/modals/output/AlertModal";

// types
type Props = NativeStackScreenProps<any>;

const PeriodScreen: React.FC<Props> = ({ navigation }) => {
  // variables
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 60;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const token = useToken();
  const { theme } = useTheme();
  const styles = useMemo(() => createPeriodStyles(theme), [theme]);

  // use states
  const [isOnline, setIsOnline] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  // modals
  const [addLookoutModalVisible, setAddLookoutModalVisible] = useState(false);
  const [issueDetailModalVisible, setIssueDetailModalVisible] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });

  // fetch data
  const {
    data: _periodData,
    isLoading: periodLoading,
    refetch: refetchPeriod,
    isError: periodError,
  } = usePeriod(token, user?.id);

  // select data - all from the single batched API call
  const status = usePeriodSelector(user?.id, (d) => d?.status);
  const todaysIssues = usePeriodSelector(
    user?.id,
    (d) => d?.todaysIssues || []
  );
  const aidsForToday = usePeriodSelector(
    user?.id,
    (d) => d?.aidsForToday || []
  );
  const recentCycles = usePeriodSelector(
    user?.id,
    (d) => d?.recentCycles || []
  );
  const averages = usePeriodSelector(user?.id, (d) => d?.averages);
  const lookouts = usePeriodSelector(user?.id, (d) => d?.lookouts || []);
  const role = usePeriodSelector(user?.id, (d) => d?.role) || "none";
  const periodUserId = usePeriodSelector(user?.id, (d) => d?.periodUserId);
  const periodUserName = usePeriodSelector(user?.id, (d) => d?.periodUserName);
  const isPartnerView = role === "partner";

  // use effects
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // handlers
  const handleStartPeriod = async () => {
    if (!token || !user?.partnerId) {
      return;
    }

    setLoading(true);
    try {
      await startPeriod(token, user.partnerId);
      queryClient.invalidateQueries({ queryKey: ["period", user?.id] });
      setAlertConfig({
        type: "success",
        title: "Period Started",
        message:
          "Period has been logged successfully. Take care of your partner! 💕",
      });
      setAlertVisible(true);
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || "Failed to start period");
    } finally {
      setLoading(false);
    }
  };

  const handleEndPeriod = async () => {
    if (!token || !status?.cycle?.id) {
      return;
    }

    setLoading(true);
    try {
      await endPeriod(token, status.cycle.id);
      queryClient.refetchQueries({ queryKey: ["period", user?.id] });
      setAlertConfig({
        type: "success",
        title: "Period Ended",
        message: "Great! The cycle has been recorded. 🌸",
      });
      setAlertVisible(true);
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || "Failed to end period");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkLookoutSeen = async (lookoutId: number) => {
    if (!token) {
      return;
    }

    try {
      await markLookoutSeen(token, lookoutId);
      queryClient.invalidateQueries({ queryKey: ["period", user?.id] });
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || "Failed to mark as seen");
    }
  };

  const handleViewIssue = (issue: any) => {
    setSelectedIssue(issue);
    setIssueDetailModalVisible(true);
  };

  const openAddCustomAidScreen = () => {
    navigation.navigate("AddCustomAidScreen");
  };

  const openLogIssueScreen = () => {
    navigation.navigate("LogIssueScreen");
  };

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["period", user?.id] });
    }, [queryClient, user?.id])
  );

  const handleLookoutAdded = () => {
    setAddLookoutModalVisible(false);
    queryClient.invalidateQueries({ queryKey: ["period", user?.id] });
    setToastMessage("Lookout reminder added successfully!");
  };

  if (periodError) {
    return (
      <ErrorState
        message="Failed to load period information. Try again?"
        onRetry={() => refetchPeriod()}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {!isOnline && (
        <View
          style={{
            backgroundColor: "#ff6b6b",
            position: "absolute",
            top: insets.top,
            left: 0,
            right: 0,
            zIndex: 10,
            paddingVertical: 2,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center", fontSize: 12 }}>
            You are offline
          </Text>
        </View>
      )}

      <View
        style={{
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
          height: HEADER_HEIGHT + insets.top,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            color: theme.colors.text,
            letterSpacing: 0,
          }}
        >
          Period Tracker
        </Text>

        {role === "period_user" && (
          <TouchableOpacity
            style={{
              position: "absolute",
              top: insets.top + (HEADER_HEIGHT - 36) / 2,
              right: 18,
              zIndex: 10,
              backgroundColor: theme.colors.surfaceAlt,
              borderRadius: 20,
              padding: 8,
              shadowColor: theme.colors.shadow,
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
            onPress={openAddCustomAidScreen}
          >
            <Feather name="plus" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {!periodLoading && role === "none" && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🌸</Text>
            <Text style={styles.emptyStateTitle}>
              Period Tracking Not Set Up
            </Text>
            <Text style={styles.emptyStateText}>
              An admin needs to register you or your partner for period tracking
              first. Once set up, you'll be able to track cycles and get helpful
              tips here.
            </Text>
          </View>
        )}

        {periodLoading ? (
          <Shimmer height={200} radius={24} style={{ marginBottom: 20 }} />
        ) : role !== "none" && status ? (
          <PeriodStatusCard
            status={status}
            onStartPeriod={handleStartPeriod}
            onEndPeriod={handleEndPeriod}
            isPartnerView={isPartnerView}
            loading={loading}
            averages={averages}
          />
        ) : role !== "none" ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🌺</Text>
            <Text style={styles.emptyStateTitle}>Start Tracking</Text>
            <Text style={styles.emptyStateText}>
              {isPartnerView
                ? `Tap the button to start logging ${
                    periodUserName || "your partner"
                  }'s period`
                : "Your partner will log your period for you"}
            </Text>
          </View>
        ) : null}

        {role !== "none" && (
          <>
            <QuickActionsRow
              isOnPeriod={status?.status === "on_period"}
              isPartnerView={isPartnerView}
              onAddCustomAid={openAddCustomAidScreen}
              onViewAllAids={() => {}}
              onLogIssue={openLogIssueScreen}
              onAddLookout={() => setAddLookoutModalVisible(true)}
            />

            {periodLoading ? (
              <Shimmer height={120} radius={20} style={{ marginBottom: 16 }} />
            ) : (
              <TodaysIssuesCard
                issues={todaysIssues || []}
                onViewIssue={handleViewIssue}
                onLogIssue={openLogIssueScreen}
                isPartnerView={isPartnerView}
              />
            )}

            {aidsForToday && aidsForToday.length > 0 && (
              <PeriodAidsSection aidsForToday={aidsForToday} />
            )}

            {lookouts && lookouts.length > 0 && (
              <LookoutsSection
                lookouts={lookouts}
                onMarkSeen={handleMarkLookoutSeen}
              />
            )}

            {periodLoading ? (
              <Shimmer height={180} radius={20} style={{ marginBottom: 16 }} />
            ) : recentCycles && recentCycles.length > 0 && averages ? (
              <PreviousCycleCard cycles={recentCycles} averages={averages} />
            ) : null}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <AddLookoutModal
        visible={addLookoutModalVisible}
        onClose={() => setAddLookoutModalVisible(false)}
        onSuccess={handleLookoutAdded}
        periodUserId={periodUserId}
      />

      <IssueDetailModal
        visible={issueDetailModalVisible}
        issue={selectedIssue}
        onClose={() => {
          setIssueDetailModalVisible(false);
          setSelectedIssue(null);
        }}
      />

      <AlertModal
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttonText="Got it"
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

export default PeriodScreen;
