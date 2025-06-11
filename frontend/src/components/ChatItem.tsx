import { PCOLOR } from "../constant";
import { Chat } from "../type";
import { cn } from "../utils/cn";

interface ChatItemProps {
  chats: Chat[];
}
export default function ChatItem({ chats }: ChatItemProps) {
  return (
    <>
      {chats.map((chat, index) => {
        const color = { color: PCOLOR[chat.order - 1] };

        switch (chat.announceType) {
          case "in":
          case "out":
            return (
              <AnnouncementMessage
                key={index}
                color={color}
                displayName={chat.displayName}
                action={chat.announceType === "in" ? "joined" : "left"}
              />
            );

          case "nameChange":
            return (
              <NameChangeMessage
                key={index}
                color={color}
                prevName={chat.prevName!}
                displayName={chat.displayName}
              />
            );

          default:
            return (
              <ChatMessage
                key={index}
                color={color}
                displayName={chat.displayName}
                message={chat.message}
              />
            );
        }
      })}
    </>
  );
}
const AnnouncementMessage = ({
  color,
  displayName,
  action,
}: {
  color: React.CSSProperties;
  displayName: string;
  action: string;
}) => (
  <div className="text-sm text-white/80 break-words whitespace-pre-wrap pl-1">
    {/* {"[ "} */} {"・ "}
    <span style={color}>{displayName} </span>
    has 
    <span className={cn("", action =="joined" ? "text-lime-400" : "text-rose-400")}>
    {" "}{action}{" "}
    </span>
     the room.
    {/* {" ]"} */}
  </div>
);

const NameChangeMessage = ({
  color,
  prevName,
  displayName,
}: {
  color: React.CSSProperties;
  prevName: string;
  displayName: string;
}) => (
  <div className="text-sm text-white/80 break-words whitespace-pre-wrap pl-1">
    {/* {"[ "} */}
    <span style={color}>{prevName} </span>
    changed name to <span style={color}>{displayName}</span>
    {/* {". ]"} */}
  </div>
);

const ChatMessage = ({
  color,
  displayName,
  message,
}: {
  color: React.CSSProperties;
  displayName: string;
  message: string;
}) => (
  <div className="text-sm text-white/80 break-words whitespace-pre-wrap pl-1">
    <span style={color}>{displayName}: </span>
    {message}
  </div>
);
