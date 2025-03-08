import { PCOLOR } from "../constant";
import { Chat } from "../type";

interface ChatItemProps {
  chats: Chat[];
}
export default function ChatItem({ chats }: ChatItemProps) {
  return (
    <>
      {chats.map((chat, index) => {
        const color = { color: PCOLOR[chat.order - 1] };

        switch (chat.isAnnounce) {
          case "in":
          case "out":
            return (
              <AnnouncementMessage
                key={index}
                color={color}
                displayName={chat.displayName}
                action={chat.isAnnounce === "in" ? "joined" : "left"}
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
  <div className="text-sm text-orange break-words whitespace-pre-wrap pl-1">
    {"[ "}
    <span style={color}>{displayName} </span>
    has {action} the room.
    {" ]"}
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
  <div className="text-sm text-orange break-words whitespace-pre-wrap pl-1">
    {"[ "}
    <span style={color}>{prevName} </span>
    changed name to <span style={color}>{displayName}</span>
    {". ]"}
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
  <div className="text-sm text-lightgray break-words whitespace-pre-wrap pl-1">
    <span style={color}>{displayName}: </span>
    {message}
  </div>
);
