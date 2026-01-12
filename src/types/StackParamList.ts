import { SocialMediaPlatform } from "./Streak";

export type RootStackParamList = {
  Welcome: undefined;
  Name: undefined;
  Username: undefined;
  Password: undefined;
  ExistingUsername: undefined;
  PinVerification: { username: string };
  NewPassword: { username: string };
  ResetSuccess: undefined;
  Login: undefined;
  Main: undefined;
  ChatScreen: { showOptions?: boolean; chatId?: string } | undefined;
  GameWaitingScreen: { roomId?: string } | undefined;
  GameSetupScreen: undefined;
  GameSessionScreen: { sessionId?: string } | undefined;
  PartnerChatScreen: { partnerId?: string } | undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  Search: undefined;
  PartnerProfile: { userId?: string } | undefined;
  UserProfile: { userId?: string } | undefined;
  PortalScreen: undefined;
  SentMessagesScreen: undefined;
  ReceivedMessagesScreen: undefined;
  StreakScreen: undefined;
  LogStreakScreen: {
    platforms: SocialMediaPlatform[];
    user: { id: number; name: string; avatar?: string };
    partner: { id: number; name: string; avatar?: string };
    onLog: (accusedUserId: number, platform: SocialMediaPlatform) => void;
    loading?: boolean;
  };
  AddResolutionScreen: {
    onSuccess: () => void;
  };
  PresentsScreen: undefined;
  CartScreen: undefined;
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  Settings: undefined;
  ChangeEmail: undefined;
  VerifyEmailOTP: undefined;
  ChangePassword: undefined;
  NotificationsScreen: undefined;
  PendingRequests: undefined;
  AccountScreen: undefined;
  AboutScreen: undefined;
  StreakScreen: undefined;
};

export type PresentsStackParamList = {
  PresentsScreen: undefined;
  GameListScreen: undefined;
  CartScreen: undefined;
};

export type PeriodStackParamList = {
  PeriodScreen: undefined;
  CycleHistoryScreen: undefined;
  AllAidsScreen: undefined;
  AddCustomAidScreen: {
    onSuccess: () => void;
  };
  LogIssueScreen: {
    onSuccess: () => void;
  };
};

export type OursStackParamList = {
  OursScreen: undefined;
  NotesScreen: undefined;
  AllCanvasesScreen: undefined;
  CanvasEditorScreen: { canvasId: number };
  TimelineScreen: undefined;
  AllFavoriteMemoriesScreen: undefined;
  CartScreen: undefined;
};
