import { useState, useCallback } from "react";
import { useAccounts } from "@/hooks/useAccounts";
import { useAccountStatus, StatusResponse } from "@/hooks/useAccountStatus";
import { AccountCard } from "@/AccountCard";
import { AccountDetailsModal } from "@/AccountDetailsModal";
import { AddAccountModal } from "@/AddAccountModal";
import { ProxyModal } from "@/ProxyModal";
import { SpawnerSection } from "@/SpawnerSection";
import { StatusResponseModal } from "@/StatusResponseModal";
import { Header } from "@/Header";
import { Button } from "@/ui/button";
import { Account } from "@/types/account";
import { Plus, Users, Shield, Box } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

const Index = () => {
  const {
    accounts,
    proxies,
    spawnerTransactions,
    addAccount,
    updateAccount,
    deleteAccount,
    addProxy,
    deleteProxy,
    assignProxy,
    getProxyAccountCount,
    addSpawnerTransaction,
    deleteSpawnerTransaction,
    getParentAccounts,
    getChildAccounts,
  } = useAccounts();

  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [proxyAccount, setProxyAccount] = useState<Account | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusResponses, setStatusResponses] = useState<Map<string, StatusResponse>>(new Map());
  const [statusModalAccount, setStatusModalAccount] = useState<Account | null>(null);

  // Status checking
  const handleStatusUpdate = useCallback(
    (id: string, isOnline: boolean, response: StatusResponse) => {
      updateAccount(id, { isOnline, lastChecked: new Date() });
      setStatusResponses(prev => {
        const newMap = new Map(prev);
        newMap.set(id, response);
        return newMap;
      });
    },
    [updateAccount]
  );

  useAccountStatus(accounts, handleStatusUpdate);

  const toggleExpand = (parentId: string) => {
    setExpandedParents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) {
        newSet.delete(parentId);
      } else {
        newSet.add(parentId);
      }
      return newSet;
    });
  };

  const parentAccounts = getParentAccounts();
  const onlineCount = accounts.filter((a) => a.isOnline).length;

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20 p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text">MC Paskyrų Valdymas</h1>
              <p className="text-muted-foreground mt-1">
                {accounts.length} paskyros • {onlineCount} prisijungę
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Pridėti paskyrą
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{accounts.length}</p>
                  <p className="text-sm text-muted-foreground">Viso paskyrų</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/20 rounded-lg">
                  <div className="w-5 h-5 rounded-full status-online" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{onlineCount}</p>
                  <p className="text-sm text-muted-foreground">Prisijungę</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{proxies.length}</p>
                  <p className="text-sm text-muted-foreground">Proxy</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/20 rounded-lg">
                  <Box className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{parentAccounts.length}</p>
                  <p className="text-sm text-muted-foreground">Motininiai</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="accounts" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="accounts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Paskyros
              </TabsTrigger>
              <TabsTrigger value="spawners" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Spawneriai
              </TabsTrigger>
            </TabsList>

            <TabsContent value="accounts" className="space-y-4">
              {parentAccounts.length === 0 ? (
                <div className="glass-card p-12 rounded-lg text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Nėra paskyrų
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Pradėkite pridėdami savo pirmą Minecraft paskyrą
                  </p>
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Pridėti paskyrą
                  </Button>
                </div>
              ) : (
                parentAccounts.map((parent) => (
                  <AccountCard
                    key={parent.id}
                    account={parent}
                    childAccounts={getChildAccounts(parent.id)}
                    proxy={proxies.find((p) => p.id === parent.proxyId)}
                    isExpanded={expandedParents.has(parent.id)}
                    onToggleExpand={() => toggleExpand(parent.id)}
                    onDelete={deleteAccount}
                    onShowDetails={setSelectedAccount}
                    onManageProxy={setProxyAccount}
                    onShowStatus={setStatusModalAccount}
                    statusResponse={statusResponses.get(parent.id)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="spawners">
              <SpawnerSection
                transactions={spawnerTransactions}
                onAdd={addSpawnerTransaction}
                onDelete={deleteSpawnerTransaction}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <AccountDetailsModal
        account={selectedAccount}
        open={!!selectedAccount}
        onClose={() => setSelectedAccount(null)}
        onUpdateUsername={(id, username) => updateAccount(id, { username })}
      />

      <AddAccountModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addAccount}
        parentAccounts={parentAccounts}
      />

      <ProxyModal
        open={!!proxyAccount}
        onClose={() => setProxyAccount(null)}
        account={proxyAccount}
        proxies={proxies}
        onAddProxy={addProxy}
        onDeleteProxy={deleteProxy}
        onAssignProxy={assignProxy}
        getProxyAccountCount={getProxyAccountCount}
      />

      <StatusResponseModal
        open={!!statusModalAccount}
        onClose={() => setStatusModalAccount(null)}
        username={statusModalAccount?.username || ''}
        response={statusModalAccount ? statusResponses.get(statusModalAccount.id) || null : null}
      />
    </>
  );
};

export default Index;
