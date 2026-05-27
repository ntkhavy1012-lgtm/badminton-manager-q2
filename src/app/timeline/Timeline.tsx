"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export type MatchLog = {
  id: string;
  member_id: string;
  member_name: string;
  action: string;
  matches_after: number;
  created_at: string;
};

export default function Timeline({ lang = "vi" }: { lang?: "vi" | "en" }) {
  const [logs, setLogs] = useState<MatchLog[] | null>(null);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("match_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Supabase fetch error:", error);
    }
    if (data) setLogs(data as MatchLog[]);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const translateAction = (action: string) => {
    if (lang === "vi") return action;
    
    if (action === "Trận xếp") return "Auto Match";
    if (action === "Trận order") return "Order Match";
    if (action === "+1 trận") return "+1 match";
    if (action === "-1 trận") return "-1 match";
    
    return action
      .replace("+1 trận", "+1 match")
      .replace("-1 trận", "-1 match")
      .replace("Trận xếp", "Auto Match")
      .replace("Trận order", "Order Match");
  };

  if (logs === null) {
    return <div className="timeline-loading">{lang === "vi" ? "Đang tải dữ liệu..." : "Loading data..."}</div>;
  }

  if (logs.length === 0) {
    return <div className="timeline-empty">{lang === "vi" ? "Chưa có dữ liệu hoạt động" : "No activity data yet"}</div>;
  }

  return (
    <div className="timeline-container">
      <div className="timeline-list">
        {logs.map((log) => {
          const isMatchCreation = log.action.includes("Trận");
          const isAddMatch = log.action.includes("+1");
          const isRemoveMatch = log.action.includes("-1");
          
          let icon = "📝";
          let badgeClass = "timeline-badge-default";
          
          if (isMatchCreation) {
            icon = "🏸";
            badgeClass = log.action === "Trận order" ? "timeline-badge-order" : "timeline-badge-match";
          } else if (isAddMatch) {
            icon = "📈";
            badgeClass = "timeline-badge-add";
          } else if (isRemoveMatch) {
            icon = "📉";
            badgeClass = "timeline-badge-remove";
          }

          return (
            <div key={log.id} className="timeline-item">
              <div className="timeline-icon-wrapper">
                <span className="timeline-icon">{icon}</span>
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="timeline-user">{log.member_name}</span>
                  <span className={`timeline-badge ${badgeClass}`}>{translateAction(log.action)}</span>
                </div>
                <div className="timeline-meta">
                  <span className="timeline-time">
                    {new Date(log.created_at).toLocaleString(lang === "vi" ? "vi-VN" : "en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                  {log.matches_after > 0 && (
                    <span className="timeline-count">
                      {lang === "vi" ? `Sau cập nhật: ${log.matches_after} trận` : `After update: ${log.matches_after} matches`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
