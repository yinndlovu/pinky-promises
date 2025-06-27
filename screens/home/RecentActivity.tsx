// screens/home/RecentActivity.tsx
import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";

type Activity = {
    id: string;
    description: string;
    date: string;
    time: string;
};

type Props = {
    activities: Activity[];
};

const RecentActivity: React.FC<Props> = ({ activities }) => (
    <View style={styles.container}>
        <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
        <FlatList
            data={activities}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
                <View style={styles.activityRow}>
                    <View style={styles.iconWrapper}>
                        <Feather name="activity" size={20} color="#e03487" />
                    </View>
                    <View style={styles.textWrapper}>
                        <Text style={styles.description}>{item.description}</Text>
                        <Text style={styles.datetime}>
                            {item.date} • {item.time}
                        </Text>
                    </View>
                </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            scrollEnabled={false}
        />
    </View>
);

const styles = StyleSheet.create({
    container: {
        width: "100%",
        marginTop: 32,
        marginBottom: 50,
    },
    sectionTitle: {
        fontSize: 14,
        color: "#b0b3c6",
        letterSpacing: 1,
        textTransform: "uppercase",
        marginLeft: 16,
        marginBottom: 10,
        alignSelf: "flex-start"
    },
    activityRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 16,
        paddingHorizontal: 8,
        backgroundColor: "#1b1c2e",
        borderRadius: 12,
        marginBottom: 6,
        width: "100%"
    },
    iconWrapper: {
        marginRight: 12,
        marginTop: 2,
    },
    textWrapper: {
        flex: 1,
    },
    description: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 2,
    },
    datetime: {
        color: "#b0b3c6",
        fontSize: 13,
        fontWeight: "400",
    },
    separator: {
        height: 6,
    },
});

export default RecentActivity;
